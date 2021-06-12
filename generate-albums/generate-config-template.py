#!/usr/bin/python3.9

import argparse
import os
import json

parser = argparse.ArgumentParser("Create a config.json template for all images in target.")
parser.add_argument("target", help="Target path where the images are.")

args = parser.parse_args()
target = args.target

files = {f: "" for f in os.listdir(target)}
config = {
    "descriptions": files,
    "background": {
        "file": "",
        "y": 0
    },
    "thumbnail": ""
}

with open("config.json", "w") as f:
    json.dump(config, f, indent=4, sort_keys=True)
