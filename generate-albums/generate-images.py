#!/usr/bin/python3.9

import argparse
import os

from PIL import Image, ImageOps


def main():
    parser = argparse.ArgumentParser("Create fullsize images with watermark and thumbnail images.")
    parser.add_argument("name", help="Name for the album.")
    parser.add_argument("target", help="Target path where the original images are.")

    args = parser.parse_args()
    album_name = args.name
    target = args.target

    os.makedirs("fullsize", exist_ok=True)
    os.makedirs("thumbs", exist_ok=True)

    files = os.listdir(target)

    for i, f in enumerate(sorted(files), start=1):
        print(f"{i}/{len(files)}", end="\r")

        og_img = ImageOps.exif_transpose(Image.open(os.path.join(target, f)))

        # fullsize
        img = og_img.copy()

        # resize
        width, height = img.size
        if width > height:
            factor = 2000 / width
        else:
            factor = 2000 / height
        img = img.resize((int(width * factor), int(height * factor)), Image.LANCZOS)

        img.save(os.path.join("fullsize", f"{album_name}-fullsize-{i:03d}.jpg"), quality=80, optimize=True)

        # thumbnail
        img = og_img.copy()

        # resize
        width, height = img.size
        if width / height < 600 / 450:
            factor = 600 / width
        else:
            factor = 450 / height
        img = img.resize((int(width * factor), int(height * factor)), Image.LANCZOS)
        width, height = img.size
        img = img.crop((width // 2 - 600 // 2,  # left
                        height // 2 - 450 // 2,  # top
                        width // 2 + 600 // 2,  # right
                        height // 2 + 450 // 2))  # bottom

        img.save(os.path.join("thumbs", f"{album_name}-thumb-{i:03d}.jpg"), quality=80, optimize=True)


if __name__ == '__main__':
    main()
