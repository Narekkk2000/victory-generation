#!/usr/bin/env python3
"""Read actual media dimensions instead of assuming a format from its extension."""

import argparse
import json
from pathlib import Path
import subprocess


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('content', nargs='?', default='src/content/guideStories.json')
    args = parser.parse_args()
    content_path = Path(args.content)
    content = json.loads(content_path.read_text())
    public = Path('public').resolve()
    dimensions = {}
    updated = 0

    def visit(value):
        nonlocal updated
        if isinstance(value, list):
            for child in value:
                visit(child)
        elif isinstance(value, dict):
            if {'src', 'width', 'height'} <= value.keys():
                src = value['src']
                if src.startswith('/'):
                    path = (public / src.lstrip('/')).resolve()
                    path.relative_to(public)
                    if src not in dimensions:
                        result = subprocess.check_output([
                            'magick', 'identify', '-ping', '-format', '%w %h', f'{path}[0]',
                        ], text=True)
                        dimensions[src] = tuple(map(int, result.split()))
                    width, height = dimensions[src]
                    if (value['width'], value['height']) != (width, height):
                        value.update(width=width, height=height)
                        updated += 1
            for child in value.values():
                visit(child)

    visit(content)
    content_path.write_text(json.dumps(content, ensure_ascii=False, indent=2) + '\n')
    print(f'Updated {updated} media dimensions from {len(dimensions)} actual files.')


if __name__ == '__main__':
    main()
