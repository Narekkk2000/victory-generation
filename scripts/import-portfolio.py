"""Import the supplied portfolio without changing the original files.

Requires cwebp, ImageMagick, and ffmpeg. Run from any directory:
python3 scripts/import-portfolio.py /path/to/Portfolio /path/to/content.md
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
DOCUMENT = Path(sys.argv[2])
SLUGS = {
    'Frostiez': 'frostiez', 'Happy Botanist': 'happy-botanist',
    'Frost': 'frost', 'Weeed': 'weeed', 'Call The Queens': 'call-the-queens',
}


def run(*args):
    return subprocess.check_output(args, text=True, stderr=subprocess.DEVNULL).strip()


portfolio = {}
for chunk in re.split(r'^## ', DOCUMENT.read_text(), flags=re.M)[1:]:
    title = chunk.splitlines()[0].replace('**', '').split(' — ', 1)[1].strip()
    if title not in SLUGS:
        continue
    content = {}
    for section in re.split(r'^### ', chunk, flags=re.M)[1:]:
        heading, body = section.split('\n', 1)
        heading = heading.replace('**', '').replace(' — NEW', '').strip()
        body = re.split(r'\n\*(?:Page titles|Captions)', body)[0]
        content[heading] = [p.replace('**', '').replace('\\+', '+').strip() for p in body.strip().split('\n\n') if p.strip()]
    portfolio[SLUGS[title]] = {'title': title, 'content': content, 'media': {}}

sources = json.loads((ROOT / 'scripts/portfolio-sources.json').read_text())
for item in sources:
    slug, name = item['project'], item['name']
    source = SOURCE / item['source']
    directory = ROOT / 'public/media/projects' / slug
    directory.mkdir(parents=True, exist_ok=True)
    video = source.suffix.lower() == '.mp4'
    destination = directory / (name + ('.mp4' if video else '.webp'))
    if video:
        probe = json.loads(run('ffprobe', '-v', 'quiet', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', str(source)))['streams'][0]
        width, height = probe['width'], probe['height']
        if not destination.exists():
            if width <= 1920 and height <= 1080:
                shutil.copyfile(source, destination)
            else:
                run('ffmpeg', '-y', '-i', str(source), '-vf', "scale=w='min(1920,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2", '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(destination))
        probe = json.loads(run('ffprobe', '-v', 'quiet', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', str(destination)))['streams'][0]
        width, height = probe['width'], probe['height']
    else:
        width, height = map(int, run('magick', 'identify', '-format', '%w %h', str(source)).split())
        scale = min(1, 2200 / max(width, height))
        width, height = round(width * scale), round(height * scale)
        if not destination.exists():
            run('cwebp', '-quiet', '-q', '86', '-mt', '-resize', str(width), str(height), str(source), '-o', str(destination))
    portfolio[slug]['media'][name] = {'src': f'/media/projects/{slug}/{destination.name}', 'width': width, 'height': height, 'type': 'video' if video else 'image'}
    if name == 'cover':
        thumbnail = ROOT / 'public/media/thumb/projects' / slug / 'cover.webp'
        thumbnail.parent.mkdir(parents=True, exist_ok=True)
        if not thumbnail.exists():
            run('cwebp', '-quiet', '-q', '82', '-resize', '800', '0', str(source), '-o', str(thumbnail))
    print(f'{slug}/{destination.name}', flush=True)

(ROOT / 'src/content/portfolio.json').write_text(json.dumps(portfolio, ensure_ascii=False, indent=2) + '\n')
