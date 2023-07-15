# JS Gallery

## Installation

### Including iife script to head from package

1. Install package with `npm i @IwanSergeew/js-gallery`.

2. Add following line in `<head>` and change `dir` to node-modules directory.

```html
<script src="{dir}/IwanSergeew/js-gallery/dist/iife/index.js"></script>
```

3. If you want to use the provided css add this line also.

```html
<link rel="stylesheet" href="{dir}/IwanSergeew/js-gallery/dist/css/style.css" />
```

4. Make a new `<div>` in your html file. Add an id or class to it. The example has an id `gallery`. Fill the div with images.

```html
<div id="gallery">
  <img src="img/1.jpg" alt="1" />
  <img src="img/2.jpg" alt="2" />
  <img src="img/3.jpg" alt="3" />
  <img src="img/4.jpg" alt="4" />
  <img src="img/5.jpg" alt="5" />
  <img src="img/6.jpg" alt="6" />
</div>
```

5. In your javascript file executed after html has loaded add:

```javascript
new Gallery({ selector: "#gallery" });
```

### Using HTML attributes

soon

## Configuration

[*] indicates a mandatory field

```javascript
new Gallery({
  selector: "#gallery", // [*][HTMLElement | string] The element or selector of the gallery images container;
  images: [], // [array] An array of images to be added in the gallery, can be used instead of adding them to the html;
  mainImage: true, // [enable | disable] the main image;
  extraImages: true, // [enable | disable] the extra images;
  excludeMainFromExtraImages: true, // [enable | disable] hidden first image from the extra images;
  transitionSpeed: 500, // [number] transition speed in milliseconds;
  navButtons: true, // [enable | disable] the previous and next image buttons;
  modal: {
    enable: true, // [*][enable | disable] modal
    clickExtraImageOpenModal: true, // [enable | disable] clicked extra images open modal
    mainImageFollowModal: true, // [enable | disable] change on modal main image changes gallery main image
  },
});
```

## Example image

![Example image](https://github.com/IwanSergeew/js-gallery/blob/main/example/example.png)
