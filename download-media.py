"""Download the documented stock placeholders. Run once; not required by the app."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlopen, Request
import json

root = Path(__file__).parent / 'public' / 'media'
photos = {
    'lace': 'photo-1639762681485-074b7f938ba0',
    'transfer-room': 'photo-1522778119026-d647f0596c20',
    'nhs': 'photo-1576091160399-112ba8d25d1d',
    'bridge': 'photo-1559028006-448665bd7c7f',
    'retro-player': 'photo-1461360370896-922624d12aa1',
    'safekeeper': 'photo-1485827404703-89b55fcc595e',
    'travel-companion': 'photo-1469854523086-cc02fe5d8800',
    'unlaced': 'photo-1618005182384-a83a8bd57fbe',
    'allan-ltd': 'photo-1522071820081-009f0129c71c',
}
videos = {
    'nightnight': ('9341428', [30, 25, 24]),
    'retro-player': ('18147009', [30]),
    'lace': ('7450203', [30]),
}

def download(url, path):
    request = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(request, timeout=45) as response:
        data = response.read()
    path.write_bytes(data)
    return len(data)

def photo(item):
    slug, photo_id = item
    try:
        size = download(f'https://images.unsplash.com/{photo_id}?w=1400&q=85&fit=crop', root / f'{slug}.jpg')
        return {'asset': slug, 'size': size, 'ok': True}
    except Exception as error:
        return {'asset': slug, 'error': str(error)}

def video(item):
    slug, (video_id, rates) = item
    for quality, dimensions in [('hd', '1280_720'), ('hd', '1920_1080'), ('uhd', '3840_2160')]:
        for rate in rates:
            url = f'https://videos.pexels.com/video-files/{video_id}/{video_id}-{quality}_{dimensions}_{rate}fps.mp4'
            try:
                size = download(url, root / f'{slug}.mp4')
                return {'asset': slug, 'size': size, 'video': url, 'ok': True}
            except Exception:
                pass
    return {'asset': slug, 'error': 'No matching video rendition'}

with ThreadPoolExecutor(max_workers=6) as pool:
    results = list(pool.map(photo, photos.items())) + list(pool.map(video, videos.items()))
print(json.dumps(results, indent=2))
