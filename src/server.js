import express from 'express';
import { resolve } from 'path';
import { getRawUrl, slugify } from "./sandbox";


const app = express();
app.set('view engine', 'ejs');


app.get('/:title', async (req, res) => {
    try {
        
        const { title } = req.params;
        const url = `https://hd-arab.com/${slugify(title)}`;
        console.log(url);
        const stream = await getRawUrl(url);
        return res.render("index", {
          stream: "https://storage.googleapis.com/staging.europe-west-183009.appspot.com/JIM/Movies/20.10.2017/08/Star.Trek.Beyond.2016.1080p.BluRay.x264.YTS.AG.mp4"
        });
    } catch (error) {
        const { title } = req.params;
        const url = `https://hd-arab.com/${slugify(title)}`;
        console.log(url);
        res.render('404');
    }
});

app.listen(3000, () => console.log('Server running on port 3000'))