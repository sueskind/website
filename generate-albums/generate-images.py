#!/usr/bin/python3.9

import argparse
import os
import random

from PIL import Image, ImageOps

SHUFFLE_SEED = 1

RESOLUTION_FULL = 2000  # length of the longer side
RESOLUTION_THUMB = (600, 450)  # width, height

QUALITY_FULL = 80
QUALITY_THUMB = 80

OUT_DIR_FULL = "fullsize"
OUT_DIR_THUMBS = "thumbs"

FILENAME_FMT_FULL = "{}-fullsize-{:03d}.jpg"
FILENAME_FMT_THUMB = "{}-thumb-{:03d}.jpg"


def main():
    parser = argparse.ArgumentParser("Create fullsize images with watermark and thumbnail images.")
    parser.add_argument("name", help="Name for the album.")
    parser.add_argument("src", help="Source directory where the original images are.")

    args = parser.parse_args()
    album_name = args.name
    source = args.src

    os.makedirs(OUT_DIR_FULL, exist_ok=True)
    os.makedirs(OUT_DIR_THUMBS, exist_ok=True)

    files = os.listdir(source)

    # deterministic shuffle
    files.sort()
    random.seed(SHUFFLE_SEED)
    random.shuffle(files)

    for i, f in enumerate(files, start=1):
        print(f"{i}/{len(files)}", end="\r")

        og_img = ImageOps.exif_transpose(Image.open(os.path.join(source, f)))

        # ----- fullsize -----
        img = og_img.copy()

        # resize
        width, height = img.size
        if width > height:
            factor = RESOLUTION_FULL / width
        else:
            factor = RESOLUTION_FULL / height
        img = img.resize((int(width * factor), int(height * factor)), Image.LANCZOS)

        img.save(os.path.join(OUT_DIR_FULL, FILENAME_FMT_FULL.format(album_name, i)), quality=QUALITY_FULL,
                 optimize=True)

        # ----- thumbnail -----
        img = og_img.copy()

        # resize
        width, height = img.size
        width_goal, height_goal = RESOLUTION_THUMB
        if width / height < width_goal / height_goal:  # if image is more stretched vertically than goal
            factor = width_goal / width
        else:  # if image is more stretched horizontally than goal
            factor = height_goal / height
        img = img.resize((int(width * factor), int(height * factor)), Image.LANCZOS)

        # center crop
        width, height = img.size
        img = img.crop((width // 2 - width_goal // 2,  # left
                        height // 2 - height_goal // 2,  # top
                        width // 2 + width_goal // 2,  # right
                        height // 2 + height_goal // 2))  # bottom

        img.save(os.path.join(OUT_DIR_THUMBS, FILENAME_FMT_THUMB.format(album_name, i)), quality=QUALITY_THUMB,
                 optimize=True)


if __name__ == '__main__':
    main()
