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
            this.addMainClickEvent(mainDiv);
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

                this.addExtraClickEvent(extraDiv);
            }
            $(selector).append(extraDivContainer);

            this.addExtraContainerScroll(extraDivContainer);
        }
    }
    addMainClickEvent(el) {
        $(el).click((e) => {
            const clickImageID = $(e.currentTarget).attr('jsg-image-id');
            
        });
    }

    addExtraClickEvent(el) {
        $(el).click((e) => {
            const clickImageID = $(e.currentTarget).attr('jsg-image-id');
            const mainImage = $('.jsg-main-image');
            const mainImageID = $(mainImage).attr('jsg-image-id');

            if(clickImageID != mainImageID) {
                $('.jsg-main-image').attr('jsg-image-id', clickImageID);
                $('.jsg-main-image img').attr('src', $(e.currentTarget).find('img').attr('src'));
            }
        });
    }

    addExtraContainerScroll(el) {
        $(el).on('wheel', (event) => {
            if(!event.originalEvent.deltaY) {
                return;
            }

            const scroll = (event.originalEvent.deltaY > 0) ? 1 : 0;
          
            console.log(scroll);
            console.log(scroll);
        });
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