template = """    <div class="img-container">
        <a href="./img/{}/fullsize/{}-fullsize-{}.jpg">
            <img src="./img/{}/thumbs/{}-thumb-{}.jpg" alt="image"/>
            <div class="textoverlay">
                <div class="description"></div>
            </div>
        </a>
    </div>
"""

region = "italy"

for i in range(7):
    print(template.format(region, region, f"{i + 1:03d}", region, region, f"{i + 1:03d}"))
