import io
import qrcode
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired

signer = TimestampSigner()


def make_qr_png(parcel_id: str, max_age_hours=48) -> bytes:
    token = signer.sign(parcel_id)
    img_io = io.BytesIO()
    qrcode.make(token, box_size=8, border=2).save(img_io, format="PNG")
    return img_io.getvalue()


def unsign_token(token: str, max_age_hours=48) -> str:
    return signer.unsign(token, max_age=max_age_hours * 3600)
