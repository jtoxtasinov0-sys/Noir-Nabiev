"""
3-sahifadagi "talabalar bilan intervyu" konsept rasmlarini Gemini orqali chizadi.
Boshlovchilarning haqiqiy rasmlari (Noir va Mavluda) namuna sifatida yuboriladi.

Ishga tushirish (repo ildizidan):  python3 embassy/gen_images.py [interview-1 ...]
Kalit: muhitning Network secrets bo'limida generativelanguage.googleapis.com uchun
(x-goog-api-key sarlavhasi) saqlangan bo'lsa, proksi uni o'zi qo'shadi.
Yoki bir martalik: GEMINI_API_KEY=... python3 embassy/gen_images.py
Boshqa model kerak bo'lsa: GEMINI_IMAGE_MODEL=...

PDF'da bu rasmlar "Konsept-vizual" deb belgilanadi: ular haqiqiy suratlar emas.
"""
import base64, io, json, os, sys, urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT = os.path.join(HERE, "img")

REFS = {
    "noir": ["assets/img/noir/avatar.jpg", "assets/img/noir/photo-1.jpg"],
    "mavluda": ["assets/img/mavluda/avatar-hq.jpg", "assets/img/mavluda/photo-2.jpg"],
}
WHO = {
    "noir": "the young man with short black hair and round black glasses shown in the first reference photos",
    "mavluda": "the young woman with long dark brown hair shown in the last reference photos",
}
STYLE = ("Keep both hosts' faces, hairstyles and glasses exactly like in the reference photos. "
         "Realistic documentary travel-show photo, natural daylight, candid moment, 35mm lens, "
         "warm natural colours, casual modern clothes. No text, no captions, no logos, no watermarks.")
SHOTS = {
    "interview-1": ("3:4", ["noir", "mavluda"], "Three people stand on a university campus in New York City, brick "
                    "buildings and autumn trees behind them. On the left: the young man with short black hair and round "
                    "black glasses from the reference photos, holding a plain black handheld microphone. In the middle, "
                    "next to him: the young woman with long dark brown hair from the reference photos, a host, listening "
                    "and smiling. On the right: the interviewed student, a Central Asian young woman with a short "
                    "shoulder-length bob haircut, a denim jacket and a backpack, clearly different from the host woman. "
                    + STYLE),
    "interview-2": ("3:4", ["mavluda"], "The young woman with long dark brown hair from the reference photos stands on "
                    "the right side of the frame and holds a plain black handheld microphone towards two Central Asian "
                    "university students sitting on stone steps on the left: a young man without glasses in a navy "
                    "hoodie, and a young woman with a short bob haircut, round face and a beige scarf. Downtown Chicago "
                    "skyscrapers behind them. Only the host has long hair; the students look clearly different from her. Keep her face and "
                    "hair exactly like in the reference photos. Realistic documentary travel-show photo, natural "
                    "daylight, candid moment, 35mm lens, warm natural colours. No text, no captions, no logos, "
                    "no watermarks."),
    "interview-3": ("3:4", ["noir", "mavluda"], f"{WHO['noir'].capitalize()} and {WHO['mavluda']} laugh together with three Central Asian "
                    "university students on a sunny palm-lined university campus in Los Angeles; he holds a "
                    "handheld microphone. " + STYLE),
}


def ref_parts(who):
    parts = []
    for key in who:
        for f in REFS[key]:
            im = Image.open(os.path.join(ROOT, f)).convert("RGB")
            im.thumbnail((768, 768))
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=88)
            parts.append({"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(buf.getvalue()).decode()}})
    return parts


def generate(name, aspect, prompt, refs):
    body = {
        "contents": [{"parts": refs + [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}},
    }
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), method="POST", headers={
        "Content-Type": "application/json",
        # Kalit muhitda saqlangan bo'lsa, proksi bu qiymatni haqiqiy kalit bilan almashtiradi.
        "x-goog-api-key": os.environ.get("GEMINI_API_KEY", "set-by-proxy"),
    })
    with urllib.request.urlopen(req, timeout=240) as r:
        data = json.load(r)
    for part in data["candidates"][0]["content"]["parts"]:
        inline = part.get("inlineData") or part.get("inline_data")
        if inline:
            img = Image.open(io.BytesIO(base64.b64decode(inline["data"]))).convert("RGB")
            path = os.path.join(OUT, name + ".jpg")
            img.save(path, quality=90)
            return path
    raise RuntimeError(f"{name}: javobda rasm yo'q: {json.dumps(data)[:400]}")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    only = sys.argv[1:]
    for name, (aspect, who, prompt) in SHOTS.items():
        if only and name not in only:
            continue
        print("ok", generate(name, aspect, prompt, ref_parts(who)))
    print("Endi PDF'ni qayta yig'ing: node embassy/build.js")
