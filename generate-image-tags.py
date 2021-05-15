template = """    <div class="img-container">
        <a href="./img/{}/fullsize/{}-fullsize-{}.jpg">
            <img src="./img/{}/thumbs/{}-thumb-{}.jpg" alt="image"/>
            <div class="textoverlay">
                <div class="description"></div>
            </div>
        </a>
    </div>
"""

region = "chile"

for i in range(1, 64):
    print(template.format(region, region, f"{i:03d}", region, region, f"{i:03d}"))
