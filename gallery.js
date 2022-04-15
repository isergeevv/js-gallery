class Gallery {
    constructor({ selector, main_image = true, extra_images = true, limit_extra_images = 3, include_main_in_extra = false }) {
        this.images = Array();
        $(selector).children().each((index, img) => {
            this.images.push({ src: $(img).attr('src'), alt: $(img).attr('alt')});
            $(img).remove();
        });

        let imgCount = this.images.length;

        if(!imgCount) {
            return;
        }
        
        if(main_image) {
            const mainDiv = $(`<div class='jsg-main-image' jsg-image-id='0'></div>`);
            const mainImg = $(`<img src='${this.images[0].src}' alt='${this.images[0].alt}' />`);
            $(mainDiv).append(mainImg);
            $(selector).append(mainDiv);
        }

        if(extra_images) {
            if(imgCount <= 1) {
                return;
            }

            const oneExtra = (include_main_in_extra) ? 0 : 1;
            if(limit_extra_images && imgCount-oneExtra > limit_extra_images) {
                imgCount = limit_extra_images + oneExtra;
            }

            const extraDivContainer = $(`<div class='jsg-extra-images'></div>`);
            let extraDiv, extraImg;
            for(let i = oneExtra; i < imgCount; i++) {
                extraDiv = $(`<div class='jsg-extra-image' jsg-image-id='${i}'></div>`);
                extraImg = $(`<img src='${this.images[i].src}' alt='${this.images[i].alt}' />`);
                $(extraDiv).append(extraImg);
                $(extraDivContainer).append(extraDiv);
            }
            $(selector).append(extraDivContainer);
        }
    }
}
$(document).ready(() => {
    new Gallery({
        selector: '.js-gallery',
        main_image: true,
        extra_images: true,
        limit_extra_images: 4,
        include_main_in_extra: true
    });
});