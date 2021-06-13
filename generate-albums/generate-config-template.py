#!/usr/bin/python3.9

import argparse
import os
import json

parser = argparse.ArgumentParser("Create a config.json template for all images in target.")
parser.add_argument("images", help="Target path where the images are.")

args = parser.parse_args()
images = args.images

files = {f: "" for f in os.listdir(images)}
config = {
    "descriptions": files,
    "background": {
        "file": "",
        "y": 0.0
    },
    "thumbnail": ""
}

print(json.dumps(config, indent=4, sort_keys=True))
