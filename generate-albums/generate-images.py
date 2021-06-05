#!/usr/bin/python3.9

import argparse
import json
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

# album, full_name, album, thumb_name, description
HMTL_FMT = """
<div class="tile">
    <a href="./img/{}/fullsize/{}">
        <img src="./img/{}/thumbs/{}" alt="image"/>
        <div class="textoverlay">
            <div class="description">{}</div>
        </div>
    </a>
</div>
"""


def main():
    parser = argparse.ArgumentParser("Create fullsize images with watermark and thumbnail images.")
    parser.add_argument("name", help="Name for the album.")
    parser.add_argument("src", help="Source directory where the original images are.")
    parser.add_argument("descr", help="Path to the description.json")

    args = parser.parse_args()
    album_name = args.name
    source = args.src
    descr = args.descr

    with open(descr, "r") as f:
        descriptions = json.load(f)

    os.makedirs(OUT_DIR_FULL, exist_ok=True)
    os.makedirs(OUT_DIR_THUMBS, exist_ok=True)

    files = os.listdir(source)

    # deterministic shuffle
    files.sort()
    random.seed(SHUFFLE_SEED)
    random.shuffle(files)

    html_output = ""

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

        full_name = FILENAME_FMT_FULL.format(album_name, i)
        img.save(os.path.join(OUT_DIR_FULL, full_name), quality=QUALITY_FULL, optimize=True)

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

        thumb_name = FILENAME_FMT_THUMB.format(album_name, i)
        img.save(os.path.join(OUT_DIR_THUMBS, thumb_name), quality=QUALITY_THUMB, optimize=True)

        html_output += HMTL_FMT.format(album_name, full_name, album_name, thumb_name, descriptions[f])

    print(html_output)


if __name__ == '__main__':
    main()
