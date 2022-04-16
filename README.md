## Preview

[tw1stybg.net/projects/jsgallery](https://tw1stybg.net/projects/jsgallery/)

# JS Gallery

Javascript image gallery made using jQuery 3.5.1

## Installation

### JS version

Include gallery.js in the `<head>`.

Make a new `<div>` with class you are going to use to select in js like `js-gallery` filled with images like this:
```html
<div class="js-gallery">
    <img src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg" alt="Tree">
    <img src="https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_960_720.jpg" alt="Nature">
    <img src="https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072821_960_720.jpg" alt="Road">
    <img src="https://cdn.pixabay.com/photo/2017/12/15/13/51/polynesia-3021072_960_720.jpg" alt="Polynesia">
    <img src="https://cdn.pixabay.com/photo/2018/11/17/22/15/trees-3822149_960_720.jpg" alt="Trees">
    <img src="https://cdn.pixabay.com/photo/2017/05/09/03/46/alberta-2297204_960_720.jpg" alt="Alberta">
    <img src="https://cdn.pixabay.com/photo/2015/06/19/21/24/avenue-815297_960_720.jpg" alt="Avenue">
    <img src="https://cdn.pixabay.com/photo/2014/04/14/20/11/pink-324175_960_720.jpg" alt="Pink">
</div>
```

In the footer of the website or in your main js file executed after html has loaded add:
```javascript
new Gallery({
    selector: '.js-gallery',
    main_image: true,
    extra_images: true,
    limit_extra_images: 6,
    include_main_in_extra: true,
    click_extra_open_modal: false,
    transition_speed: 500
});
```

### HTML attributes version

Include gallery.js in the `<head>`.

Make a new `<div>` with class `js-gallery-html` filled with images like shown in the JS version above.

Add attributes to the `<div>` and set them up:

```html
<div class="js-gallery-html" 
    main_image="true" 
    extra_images="true" 
    limit_extra_images="6" 
    include_main_in_extra="true" 
    click_extra_open_modal="false" 
    transition_speed="500"
>
    ....images
</div>
```