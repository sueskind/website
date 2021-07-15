#!/usr/bin/python3.9

import json
import os
from os.path import join
import random
from multiprocessing import Pool

from PIL import Image, ImageOps, ImageFont, ImageDraw

SHUFFLE_SEED = 1

RESOLUTION_FULL = 2000  # length of the longer side
RESOLUTION_THUMB = (600, 450)  # width, height
RESOLUTION_BG = (2560, 500)  # width > height

QUALITY_FULL = 80
QUALITY_THUMB = 80

IN_DIR = "original"
CFG_FILENAME = "config.json"
HTML_TEMPLATE_FILENAME = "template.html"
TEMPLATE_CONTENT_MARKER = "!!!CONTENT!!!"

OUT_DIR_FULL = "fullsize"
OUT_DIR_THUMBS = "thumbs"

FILENAME_FMT_FULL = "{}-fullsize-{:03d}.jpg"
FILENAME_FMT_THUMB = "{}-thumb-{:03d}.jpg"
FILENAME_FTM_ALBUM_THUMB = "{}-thumb.jpg"
FILENAME_FTM_ALBUM_BG = "{}-bg.jpg"
FILENAME_FTM_HTML_OUTPUT = "{}.html"

WATERMARK = "© Jonas Süskind"
font = ImageFont.truetype("OpenSans-Regular.ttf", 80)

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


def convert_parallel_job(i, source, target, f, album_name, thumbnail_file, background_file, background_y, description):
    # print(f"{i}/{n}", end="\r")

    og_img = ImageOps.exif_transpose(Image.open(join(source, f)))

    # ----- fullsize -----
    img = og_img.copy()

    # resize
    width, height = img.size
    if width > height:
        factor = RESOLUTION_FULL / width
    else:
        factor = RESOLUTION_FULL / height
    img = img.resize((int(width * factor), int(height * factor)), Image.LANCZOS)

    # add watermark
    text_img = Image.new("RGBA", img.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(text_img)
    draw.text(img.size, WATERMARK, fill=(255, 255, 255, 100), font=font, anchor="rb")
    img = Image.alpha_composite(img.convert("RGBA"), text_img).convert("RGB")

    full_name = FILENAME_FMT_FULL.format(album_name, i)
    img.save(join(target, OUT_DIR_FULL, full_name), quality=QUALITY_FULL, optimize=True)

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
    img.save(join(target, OUT_DIR_THUMBS, thumb_name), quality=QUALITY_THUMB, optimize=True)

    # ----- album thumbnail -----
    if f == thumbnail_file:
        img.save(join(target, FILENAME_FTM_ALBUM_THUMB.format(album_name)), quality=QUALITY_THUMB, optimize=True)

    # ----- album background -----
    if f == background_file:
        img = og_img.copy()

        # resize
        width, height = img.size
        width_goal, height_goal = RESOLUTION_BG
        factor = width_goal / width
        img = img.resize((width_goal, int(height * factor)), Image.LANCZOS)

        # crop at y
        width, height = img.size
        position = background_y * height
        img = img.crop((0, position, width, position + height_goal))

        img.save(join(target, FILENAME_FTM_ALBUM_BG.format(album_name)), quality=QUALITY_THUMB, optimize=True)

    return HMTL_FMT.format(album_name, full_name, album_name, thumb_name, description)


def convert_album(album_name, source, target, config):
    with open(config, "r") as f:
        configuration = json.load(f)
    descriptions = configuration["descriptions"]
    background_file, background_y = configuration["background"]["file"], configuration["background"]["y"]
    thumbnail_file = configuration["thumbnail"]

    os.makedirs(join(target, OUT_DIR_FULL), exist_ok=True)
    os.makedirs(join(target, OUT_DIR_THUMBS), exist_ok=True)

    files = os.listdir(source)

    # deterministic shuffle
    files.sort()
    random.seed(SHUFFLE_SEED)
    random.shuffle(files)

    pool = Pool()

    outputs = pool.starmap(
        convert_parallel_job,
        ((i, source, target, f, album_name, thumbnail_file, background_file, background_y, descriptions[f])
         for i, f in enumerate(files, start=1))
    )

    pool.close()
    pool.join()

    return "".join(outputs)


def main():
    HTML_DIR = "../photography"
    IMG_DIR = "../photography/img"

    album_list = os.listdir(IMG_DIR)  # overwrite to select specific ones
    album_list = ["austria"]

    for album in sorted(album_list):
        print(album)

        html_content = convert_album(album_name=album,
                                     source=join(IMG_DIR, album, IN_DIR),
                                     target=join(IMG_DIR, album),
                                     config=join(IMG_DIR, album, CFG_FILENAME))

        with open(join(IMG_DIR, album, HTML_TEMPLATE_FILENAME), "r") as f:
            template = f.read()

        with open(join(HTML_DIR, FILENAME_FTM_HTML_OUTPUT.format(album)), "w") as f:
            f.write(template.replace(TEMPLATE_CONTENT_MARKER, html_content))


if __name__ == '__main__':
    main()
