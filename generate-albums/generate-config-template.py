#!/usr/bin/python3.9

import argparse
import os
import json

parser = argparse.ArgumentParser("Create a config.json template for all images in target.")
parser.add_argument("target", help="Target path where the images are.")

args = parser.parse_args()
target = args.target

files = {f: "" for f in os.listdir(target)}

with open("config.json", "w") as f:
    json.dump(files, f, indent=4, sort_keys=True)
