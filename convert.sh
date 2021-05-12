# create thumbnails
parallel -q --eta \
    convert \
        -quality 80% \
        -resize 600x450^ \
        -gravity center \
        -extent 600x450 \
        '{}' 'thumbs/{.}.jpg' \
::: *.JPG

# create full-size images with watermark
parallel -q --eta \
    convert \
        -quality 80% \
        -resize 2000x1333^ \
        -gravity center \
        -extent 2000x1333 \
        -gravity SouthEast \
        -pointsize 60 \
        -fill "rgba(255,255,255,0.3)" \
        -draw "text 20,20 '© Jonas Süskind'" \
        '{}' 'full-size/{.}.jpg' \
::: *.JPG