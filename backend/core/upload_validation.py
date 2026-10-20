import codecs
from pathlib import PurePath
from xml.etree import ElementTree
from xml.etree.ElementTree import ParseError

from PIL import Image, UnidentifiedImageError


MAX_IMAGE_PIXELS = 40_000_000
MAX_SVG_BYTES = 2 * 1024 * 1024
MESSAGE_UPLOAD_MAX_BYTES = 25 * 1024 * 1024
PORTFOLIO_UPLOAD_MAX_BYTES = 50 * 1024 * 1024
AVATAR_UPLOAD_MAX_BYTES = 5 * 1024 * 1024

IMAGE_FORMATS = {
    ".bmp": ("BMP", "image/bmp"),
    ".gif": ("GIF", "image/gif"),
    ".jpeg": ("JPEG", "image/jpeg"),
    ".jpg": ("JPEG", "image/jpeg"),
    ".png": ("PNG", "image/png"),
    ".tif": ("TIFF", "image/tiff"),
    ".tiff": ("TIFF", "image/tiff"),
    ".webp": ("WEBP", "image/webp"),
}
SVG_ELEMENTS = frozenset({
    "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
    "defs", "linearGradient", "radialGradient", "stop", "clipPath", "mask", "title", "desc",
})
SVG_ATTRIBUTES = frozenset({
    "viewBox", "width", "height", "x", "y", "x1", "x2", "y1", "y2", "cx", "cy", "r", "rx", "ry",
    "d", "points", "fill", "fill-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
    "transform", "opacity", "offset", "stop-color", "stop-opacity", "id", "preserveAspectRatio",
})

DOCUMENT_TYPES = {
    ".csv": "text/csv",
    ".flac": "audio/flac",
    ".flv": "video/x-flv",
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".ogg": "audio/ogg",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".wav": "audio/wav",
    ".webm": "video/webm",
    ".wmv": "video/x-ms-wmv",
    ".avi": "video/x-msvideo",
    ".zip": "application/zip",
}

PORTFOLIO_EXTENSIONS = frozenset({*IMAGE_FORMATS, ".svg", ".avi", ".flv", ".mov", ".mp4", ".webm", ".wmv"})
AVATAR_EXTENSIONS = frozenset({".bmp", ".gif", ".jpeg", ".jpg", ".png", ".tif", ".tiff", ".webp"})
MESSAGE_EXTENSIONS = frozenset({*IMAGE_FORMATS, ".svg", *DOCUMENT_TYPES})


def _read_prefix(upload, size=4096):
    original_position = upload.tell()
    upload.seek(0)
    prefix = upload.read(size)
    upload.seek(original_position)
    return prefix


def _validate_image(upload, extension):
    expected_format, content_type = IMAGE_FORMATS[extension]
    original_position = upload.tell()
    upload.seek(0)
    try:
        with Image.open(upload) as image:
            if image.format != expected_format:
                raise ValueError("The image content does not match its file extension.")
            width, height = image.size
            if width * height > MAX_IMAGE_PIXELS:
                raise ValueError("The image dimensions exceed the allowed limit.")
            image.verify()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        raise ValueError("The uploaded image is invalid or unsafe.") from exc
    finally:
        upload.seek(original_position)
    return content_type


def _validate_text(upload):
    decoder = codecs.getincrementaldecoder("utf-8-sig")("strict")
    original_position = upload.tell()
    upload.seek(0)
    try:
        for chunk in upload.chunks():
            if b"\x00" in chunk:
                raise ValueError("Binary content is not allowed for text files.")
            decoder.decode(chunk)
        decoder.decode(b"", final=True)
    except UnicodeDecodeError as exc:
        raise ValueError("Text uploads must be valid UTF-8.") from exc
    finally:
        upload.seek(original_position)


def _validate_svg(upload):
    if upload.size > MAX_SVG_BYTES:
        raise ValueError("SVG files must not exceed 2 MB.")
    original_position = upload.tell()
    upload.seek(0)
    try:
        content = upload.read(MAX_SVG_BYTES + 1)
        if len(content) > MAX_SVG_BYTES or b"<!DOCTYPE" in content.upper() or b"<!ENTITY" in content.upper():
            raise ValueError("The SVG contains unsupported declarations or exceeds the allowed limit.")
        root = ElementTree.fromstring(content)
    except (ParseError, ValueError) as exc:
        raise ValueError("The SVG document is invalid or unsafe.") from exc
    finally:
        upload.seek(original_position)

    if root.tag.rsplit("}", 1)[-1] != "svg":
        raise ValueError("The uploaded document is not an SVG image.")
    for element in root.iter():
        tag = element.tag.rsplit("}", 1)[-1]
        if tag not in SVG_ELEMENTS:
            raise ValueError("The SVG contains unsupported elements.")
        for raw_name, value in element.attrib.items():
            name = raw_name.rsplit("}", 1)[-1]
            if name == "href":
                if not value.startswith("#"):
                    raise ValueError("External SVG references are not allowed.")
                continue
            if name not in SVG_ATTRIBUTES:
                raise ValueError("The SVG contains unsupported attributes.")
            if "url(" in value.lower() and not all(
                reference.strip().startswith("url(#") for reference in value.lower().split("url(")[1:]
            ):
                raise ValueError("External SVG resources are not allowed.")
    return "image/svg+xml"


def _validate_signature(upload, extension):
    prefix = _read_prefix(upload)
    if extension == ".svg":
        return _validate_svg(upload)
    if extension in IMAGE_FORMATS:
        return _validate_image(upload, extension)
    if extension == ".pdf" and prefix.startswith(b"%PDF-"):
        return DOCUMENT_TYPES[extension]
    if extension == ".zip" and prefix.startswith((b"PK\x03\x04", b"PK\x05\x06", b"PK\x07\x08")):
        return DOCUMENT_TYPES[extension]
    if extension in {".txt", ".csv"}:
        _validate_text(upload)
        return DOCUMENT_TYPES[extension]
    if extension in {".mp4", ".mov", ".m4a"} and len(prefix) >= 12 and prefix[4:8] == b"ftyp":
        brand = prefix[8:12]
        if extension == ".mov" and brand == b"qt  ":
            return DOCUMENT_TYPES[extension]
        if extension == ".m4a" and (brand == b"M4A " or brand.startswith(b"M4B")):
            return DOCUMENT_TYPES[extension]
        if extension == ".mp4" and brand not in {b"qt  ", b"M4A "}:
            return DOCUMENT_TYPES[extension]
    if extension == ".avi" and prefix.startswith(b"RIFF") and prefix[8:12] == b"AVI ":
        return DOCUMENT_TYPES[extension]
    if extension == ".webm" and prefix.startswith(b"\x1aE\xdf\xa3") and b"webm" in prefix.lower():
        return DOCUMENT_TYPES[extension]
    if extension == ".wmv" and prefix.startswith(b"\x30\x26\xb2\x75\x8e\x66\xcf\x11\xa6\xd9\x00\xaa\x00\x62\xce\x6c"):
        return DOCUMENT_TYPES[extension]
    if extension == ".flv" and prefix.startswith(b"FLV"):
        return DOCUMENT_TYPES[extension]
    if extension == ".mp3" and (prefix.startswith(b"ID3") or (len(prefix) > 1 and prefix[0] == 0xFF and prefix[1] & 0xE0 == 0xE0)):
        return DOCUMENT_TYPES[extension]
    if extension == ".wav" and prefix.startswith(b"RIFF") and prefix[8:12] == b"WAVE":
        return DOCUMENT_TYPES[extension]
    if extension == ".ogg" and prefix.startswith(b"OggS"):
        return DOCUMENT_TYPES[extension]
    if extension == ".flac" and prefix.startswith(b"fLaC"):
        return DOCUMENT_TYPES[extension]
    raise ValueError("The uploaded content does not match an allowed file type.")


def validate_upload(upload, *, max_bytes, allowed_extensions):
    if upload.size > max_bytes:
        raise ValueError(f"File size must not exceed {max_bytes // (1024 * 1024)} MB.")
    extension = PurePath(upload.name).suffix.lower()
    if extension not in allowed_extensions:
        raise ValueError("This file extension is not allowed.")
    return _validate_signature(upload, extension)