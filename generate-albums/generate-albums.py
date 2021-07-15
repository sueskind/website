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

OUT_DIR_FULL = "fullsize"
OUT_DIR_THUMBS = "thumbs"

FILENAME_FMT_FULL = "{}-fullsize-{:03d}.jpg"
FILENAME_FMT_THUMB = "{}-thumb-{:03d}.jpg"
FILENAME_FTM_ALBUM_THUMB = "{}-thumb.jpg"
FILENAME_FTM_ALBUM_BG = "{}-bg.jpg"
FILENAME_FTM_HTML_OUTPUT = "{}.html"

WATERMARK = "© Jonas Süskind"
font = ImageFont.truetype("OpenSans-Regular.ttf", 80)

# album_cap, album, album, album_cap, images
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="author" content="Jonas Süskind">

    <title>{} - Photography - Jonas Süskind</title>

    <link rel="shortcut icon" type="image/x-icon" href="../img/icons/favicon.png">
    <link rel="stylesheet" href="../css/global.css">
    <link rel="stylesheet" href="../css/content-page.css">

    <style>
        .title {{
            background: url("./img/{}/{}-bg.jpg") no-repeat fixed center 0;
        }}

        .accent {{
            color: #4a9904;
        }}
    </style>
</head>
<body>
<header>
    <nav>
        <ul>
            <li><a href="../index.html">{{ <span class="accent">J</span> }}</a></li>
            <li>{{<a href="../about-me.html">ab<span class="accent">o</span>ut_me</a>}}</li>
            <li>{{<a href="../coding.html">codi<span class="accent">n</span>g</a>}}</li>
            <li>{{<a href="../photography.html">photogr<span class="accent">a</span>phy</a>}}</li>
            <li>{{<a href="../generative-design.html">generative_de<span class="accent">s</span>ign</a>}}</li>
            <li>{{<a href="../blog.html">blog</a>}}</li>
        </ul>
    </nav>
</header>
<div class="title">
    <h1>{}</h1>
</div>
<div class="content">
    <div class="album">

{}

    </div>
</div>

</body>
</html>"""

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
    files = {f: "" for f in os.listdir(source)}
    configuration = {
        "descriptions": files,
        "background": {
            "file": list(files.keys())[0],
            "y": 0.0
        },
        "thumbnail": list(files.keys())[0]
    }

    if os.path.exists(config):
        with open(config, "r", encoding="utf-8") as f:
            previous_configuration = json.load(f)

        # merge configurations, previous has precedence
        configuration["background"] = previous_configuration["background"]
        configuration["thumbnail"] = previous_configuration["thumbnail"]
        for k, v in previous_configuration["descriptions"].items():
            configuration["descriptions"][k] = v

        with open(config, "w", encoding="utf-8") as f:
            json.dump(configuration, f, indent=4, sort_keys=True, ensure_ascii=False)

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

    for album in sorted(album_list):
        if not os.path.isdir(join(IMG_DIR, album)):
            continue

        print(album)

        html_content = convert_album(album_name=album,
                                     source=join(IMG_DIR, album, IN_DIR),
                                     target=join(IMG_DIR, album),
                                     config=join(IMG_DIR, album, CFG_FILENAME))

        with open(join(HTML_DIR, FILENAME_FTM_HTML_OUTPUT.format(album)), "w", encoding="utf-8") as f:
            f.write(HTML_TEMPLATE.format(album.capitalize(), album, album, album.capitalize(), html_content))


if __name__ == '__main__':
    main()
