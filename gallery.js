class Gallery {
    constructor({ selector, main_image = true, extra_images = true, limit_extra_images = 3, include_main_in_extra = false, transition_speed = 500, click_extra_open_modal = false }) {
        this.images = Array();
        this.transition_speed = transition_speed;
        this.main_image = main_image;
        this.include_main_in_extra = include_main_in_extra;
        this.click_extra_open_modal = click_extra_open_modal;
        this.gallery = $(selector);
        
        $(this.gallery).children().each((index, img) => {
            this.images.push({ src: $(img).attr('src'), alt: $(img).attr('alt')});
            $(img).remove();
        });

        let imgCount = this.images.length;

        if(!imgCount) {
            return;
        }
        
        if(this.main_image) {
            const mainDiv = $(`<div class='jsg-main-image' jsg-image-id='0'></div>`);
            const mainImg = $(`<img src='${this.images[0].src}' alt='${this.images[0].alt}' />`);
            $(mainDiv).append(mainImg);
            $(this.gallery).append(mainDiv);
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
            let extraDiv;
            for(let i = oneExtra; i < imgCount; i++) {
                extraDiv = $(`<div class='jsg-extra-image' jsg-image-id='${i}'><img src='${this.images[i].src}' alt='${this.images[i].alt}' /></div>`);
                $(extraDivContainer).append(extraDiv);

                this.addExtraClickEvent(extraDiv);
            }
            $(this.gallery).append(extraDivContainer);
            this.addExtraImagesDrag(extraDivContainer);

            this.addExtraContainerScroll(extraDivContainer);

            $(window).on('mousemove', (e) => {
                if(!this.drag) {
                    return;
                }
                const target = (this.drag == 1) ? $(this.gallery).find('.jsg-extra-images') : $(this.modalExtraImagesDiv);
                target.scrollLeft(target.scrollLeft() + ((this.lastDragX > e.pageX) ? 5 : -5));
                this.lastDragX = e.pageX;
                e.preventDefault();
            });
            $(window).on('mouseup', (e) => {
                this.drag = 0;
                e.preventDefault();
            });
        }
    }

    addMainClickEvent(el) {
        $(el).click((e) => {
            const clickImageImg = $(e.currentTarget).find('img');
            const clickImageSrc = $(clickImageImg).attr('src');
            const clickImageID = $(e.currentTarget).attr('jsg-image-id');

            this.openGalleryModal(clickImageImg, clickImageSrc, clickImageID);
        });
    }

    addExtraClickEvent(el) {
        $(el).click((e) => {
            const mainImageDiv = $(this.gallery).find('.jsg-main-image');

            if(!this.click_extra_open_modal && mainImageDiv.length) {
                const clickImageID = $(e.currentTarget).attr('jsg-image-id');
                if(clickImageID != $(mainImageDiv).attr('jsg-image-id')) {
                    $(mainImageDiv).attr('jsg-image-id', clickImageID);
                    $(mainImageDiv).find('img').attr('src', $(e.currentTarget).find('img').attr('src'));
                }
            }
            else {
                const clickImageImg = $(e.currentTarget).find('img');
                const clickImageSrc = $(clickImageImg).attr('src');
                const clickImageID = $(e.currentTarget).attr('jsg-image-id');
                this.openGalleryModal(clickImageImg, clickImageSrc, clickImageID);
            }
        });
    }

    openGalleryModal(img, src, id) {
        this.modal = $('.js-gallery-modal');
        if(this.modal.length) {
            $(this.modal).remove();
        }

        const imgOffset = $(img).offset();
        const width = $(img).width();
        const height = $(img).height();

        this.modal = $(`<div class='js-gallery-modal'>
            <div class='modal-background' style='opacity: 0;'></div>
            <div style='left: ${imgOffset.left}px; top: ${imgOffset.top}px; width: ${width}px; height: ${height}px;' class='jsg-main-img' jsg-image-id='${id}'>
                <img src='${src}' alt='${id}' />
            </div>
        </div>`);

        $('body').append(this.modal);

        this.generateCloseBtn();

        this.generateExtraImageDivs();
        
        $(this.modal).find('.modal-background').animate({
            opacity: '.9',
        }, this.transition_speed);

        $(this.modal).find('.jsg-main-img').animate({
            width: '80vw',
            height: '70vh',
            top: '5vh',
            left: '10vw'
        }, this.transition_speed, () => {
            $(this.modal).append(this.modalExtraImagesDiv);
            $(this.modal).append(this.closeBtn);
        });
        this.addModalExtraContainerScroll();
        this.addModalExtraImagesDrag();
    }

    generateCloseBtn() {
        this.closeBtn = $(`<div class='jsg-close-btn'>X</div>`);
        $(this.closeBtn).click((e) => {
            let img = $(this.gallery).find(`[jsg-image-id='${$(this.modal).find('.jsg-main-img').attr('jsg-image-id')}']`);
            const imgOffset = $(img).offset();
            if(!imgOffset) {
                $(this.modal).remove();
                return;
            }
            const width = $(img).width();
            const height = $(img).height();

            $(this.modalExtraImagesDiv).remove();
            $(this.closeBtn).remove();

            $(this.modal).find('.modal-background').animate({
                opacity: '0',
            }, this.transition_speed);

            $(this.modal).find('.jsg-main-img').animate({
                width: width,
                height: height,
                top: imgOffset.top,
                left: imgOffset.left
            }, this.transition_speed, () => {
                $(this.modal).remove();
            });
        });
    }

    generateExtraImageDivs() {
        this.modalExtraImagesDiv = $(this.gallery).find('.jsg-extra-images').clone();
        if(this.main_image && !this.include_main_in_extra) {
            $(this.modalExtraImagesDiv).prepend(`<div class='jsg-extra-image' jsg-image-id='0'><img src='${this.images[0].src}' alt='${this.images[0].alt}' /></div>`)
        }

        $(this.modalExtraImagesDiv).children().each((index, img) => {
            $(img).click((e) => {
                const mainImg = $(this.modal).find('.jsg-main-img');
                $(mainImg).attr('jsg-image-id', $(e.currentTarget).attr('jsg-image-id'));
                $(mainImg).find('img').attr('src', $(e.currentTarget).find('img').attr('src'));
            });
        });
    }

    addExtraContainerScroll(el) {
        $(el).on('wheel', (e) => {
            if(!e.originalEvent.deltaY) {
                return;
            }

            const extraImagesDiv = $(this.gallery).find('.jsg-extra-images');
            extraImagesDiv.scrollLeft(extraImagesDiv.scrollLeft() + ((e.originalEvent.deltaY > 0) ? 50 : -50));
            e.preventDefault();
        });
    }
    addModalExtraContainerScroll() {
        $(this.modalExtraImagesDiv).on('wheel', (e) => {
            if(!e.originalEvent.deltaY) {
                return;
            }

            $(this.modalExtraImagesDiv).scrollLeft($(this.modalExtraImagesDiv).scrollLeft() + ((e.originalEvent.deltaY > 0) ? 50 : -50));
        });
    }

    addExtraImagesDrag(el) {
        $(el).on('mousedown', (e) => {
            this.lastDragX = e.pageX;
            this.drag = 1;
            e.preventDefault();
        });
    }
    addModalExtraImagesDrag() {
        $(this.modalExtraImagesDiv).on('mousedown', (e) => {
            this.lastDragX = e.pageX;
            this.drag = 2;
            e.preventDefault();
        });
    }
}

$(document).ready(() => {
    $('.js-gallery-html').each((index, gallery) => {
        const options = {
            selector: gallery,
            main_image: $(gallery).attr('main_image'),
            extra_images: $(gallery).attr('extra_images'),
            limit_extra_images: Number($(gallery).attr('limit_extra_images')),
            include_main_in_extra: $(gallery).attr('include_main_in_extra'),
            click_extra_open_modal: $(gallery).attr('click_extra_open_modal'),
            transition_speed: Number($(gallery).attr('transition_speed'))
        }
        new Gallery(options);
    });

    /*
    or

    new Gallery({
        selector: '#some_gallery',
        main_image: true,
        extra_images: true,
        limit_extra_images: 6,
        include_main_in_extra: true,
        click_extra_open_modal: false,
        transition_speed: 500
    });
    */
});