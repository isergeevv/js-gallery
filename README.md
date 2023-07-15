# JS Gallery

## Installation and Usage

1. Install package with `npm i @IwanSergeew/js-gallery`.

2. Copy the following file from the package into your project and add it as a script in `<head>`.
   `node_modules/IwanSergeew/js-gallery/dist/iife/index.min.js`

3. If you want you can also use the provided css.
   `node_modules/IwanSergeew/js-gallery/dist/css/style.css`

### Using class constructor

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

4. Make a new `<div>` in your html file. Add a class `jsg` to it. Fill the div with images.

```html
<div id="jsg" data-jsg-modal-enable="true">
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
Gallery.load();
```

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
  modalEnable: true, // [*][enable | disable] modal
  modalClickExtraImageOpenModal: true, // [enable | disable] clicked extra images open modal
  modalMainImageFollowModal: true, // [enable | disable] change on modal main image changes gallery main image
});
```

```html
<div
  class="jsg"
  data-jsg-main-image="true"
  data-jsg-extra-images="true"
  data-jsg-exclude-main-from-extra-images="true"
  data-jsg-transition-speed="500"
  data-jsg-nav-buttons="true"
  data-jsg-modal-enable="true"
>
  ...
  <img src="..." alt="..." />
  ...
</div>
```

## Example image

![Example image](https://github.com/IwanSergeew/js-gallery/blob/main/example/example.png)

