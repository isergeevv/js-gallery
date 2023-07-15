# JS Gallery

## Installation

### Including iife script to head from package

Add following line in `<head>` and change `dir` to node-modules directory.

```html
<script src="{dir}/IwanSergeew/js-gallery/dist/iife/index.js"></script>
```

If you want to use the provided css add this line also.

```html
<link rel="stylesheet" href="{dir}/IwanSergeew/js-gallery/dist/css/style.css" />
```

Make a new `<div>` in your html file. Add an id or class to it. The example has an id `gallery`. Fill the div with images.

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

In your javascript file executed after html has loaded add:

```javascript
new Gallery({ selector: "#gallery" });
```

### Using HTML attributes

soon

## Configuration

[*] indicates a mandatory field

```
selector[*]: [HTMLElement | string] The element or selector of the gallery images container;
images: [array] An array of images to be added in the gallery, can be used instead of adding them to the html;
mainImage: [enable | disable] the main image;
extraImages: [enable | disable] the extra images;
excludeMainFromExtraImages: [enable | disable] hidden first image from the extra images;
transitionSpeed: [number] transition speed in milliseconds;
navButtons: [enable | disable] the previous and next image buttons;
modal[*]: {
    enable[*]: [enable | disable] modal
    clickExtraImageOpenModal: [enable | disable] clicked extra images open modal
    mainImageFollowModal: [enable | disable] change on modal main image changes gallery main image
};
```

