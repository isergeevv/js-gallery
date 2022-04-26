class Gallery {
    constructor({ selector, main_image = true, extra_images = true, limit_extra_images = null, include_main_in_extra = false, transition_speed = 500, click_extra_open_modal = false, nav_buttons = false }) {
        this.images = Array();
        this.transition_speed = transition_speed;
        this.main_image = main_image;
        this.include_main_in_extra = include_main_in_extra;
        this.click_extra_open_modal = click_extra_open_modal;
        this.nav_buttons = nav_buttons;
        this.gallery = $(selector);
        
        $(this.gallery).children().each((index, img) => {
            this.images.push({ src: $(img).attr('src'), alt: $(img).attr('alt')});
            $(img).remove();
        });

        let imgCount = this.images.length;

        if(!imgCount) {
            return;
        }
        
        const mainDiv = $(`<div class='jsg-main-image' jsg-image-id='0'></div>`);
        const mainImg = $(`<img src='${this.images[0].src}' alt='${this.images[0].alt}' />`);
        $(mainDiv).append(mainImg);
        $(this.gallery).append(mainDiv);

        if(this.main_image) {
            this.addMainClickEvent(mainDiv);
        }
        else {
            $(mainDiv).css('display', 'none');
        }

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

        if(extra_images) {
            this.addExtraImagesDrag(extraDivContainer);
            this.addExtraContainerScroll(extraDivContainer);

            $(window).on('touchmove', (e) => {
                if(!this.drag) {
                    return;
                }
                const target = (this.drag == 1) ? $(this.gallery).find('.jsg-extra-images') : $(this.modal).find('.jsg-extra-images');
                target.scrollLeft(target.scrollLeft() + (this.lastDragX - e.touches[0].pageX));
                this.lastDragX = e.touches[0].pageX;
            });
            $(window).on('mousemove', (e) => {
                if(!this.drag) {
                    return;
                }
                const target = (this.drag == 1) ? $(this.gallery).find('.jsg-extra-images') : $(this.modal).find('.jsg-extra-images');
                target.scrollLeft(target.scrollLeft() + (this.lastDragX - e.pageX));
                this.lastDragX = e.pageX;
                e.preventDefault();
            });
            $(window).on('mouseup', (e) => {
                this.drag = 0;
                e.preventDefault();
            });
        }
        else {
            extraDivContainer.css('display', 'none');
        }
        
        if(this.nav_buttons) {
            this.addNavBtns();
            this.appendBtns();
        }
    }

    addNavBtns() {
        this.btnLeft = $(`<div class="jsg-btn jsg-btn_left" style="display: none;">⏴</div>`);
        this.btnRight = $(`<div class="jsg-btn jsg-btn_right">⏵</div>`);

        $(this.btnLeft).click((e) => this.prevImage());
        $(this.btnRight).click((e) => this.nextImage());
    }

    appendBtns() {
        const element = this.modal || this.gallery;
        const mainDiv = $(element).find('.jsg-main-image');
        $(element).find('.jsg-main-image').append(this.btnLeft, this.btnRight);

        const currentMainImageId = $(mainDiv).attr('jsg-image-id');
        const currentExtraImageEl = $(element).find(`.jsg-extra-image[jsg-image-id="${currentMainImageId}"]`);
        this.toggleNavBtn('right', true);
        this.toggleNavBtn('left', true);
        if($(currentExtraImageEl).is(':last-child'))
            this.toggleNavBtn('right', false);
        else if($(currentExtraImageEl).is(':first-child'))
            this.toggleNavBtn('left', false);
    }

    toggleNavBtn(btn, show) {
        $(this.gallery).find(`.jsg-btn_${btn}`).css('display', (show ? 'block' : 'none'));
        $(this.modal).find(`.jsg-btn_${btn}`).css('display', (show ? 'block' : 'none'));
    }

    prevImage() {
        const element = this.modal || this.gallery;
        const mainImageDiv = $(element).find('.jsg-main-image');
        const prevImageId = Number($(mainImageDiv).attr('jsg-image-id')) - 1;
        const prevImageEl = $(element).find(`.jsg-extra-image[jsg-image-id="${prevImageId}"] img`);
        if(prevImageEl.length) {
            $(mainImageDiv).attr('jsg-image-id', prevImageId);
            $(mainImageDiv).find('img').attr('src', $(prevImageEl).attr('src'));
            this.toggleNavBtn('right', true);
            if($(prevImageEl).parent().is(':first-child'))
                this.toggleNavBtn('left', false);
        }
        else
            this.toggleNavBtn('left', false);
    }

    nextImage() {
        const element = this.modal || this.gallery;
        const mainImageDiv = $(element).find('.jsg-main-image');
        const nextImageId = Number($(mainImageDiv).attr('jsg-image-id')) + 1;
        const nextImageEl = $(element).find(`.jsg-extra-image[jsg-image-id="${(nextImageId)}"] img`);
        if(nextImageEl.length) {
            $(mainImageDiv).attr('jsg-image-id', nextImageId);
            $(mainImageDiv).find('img').attr('src', $(nextImageEl).attr('src'));
            this.toggleNavBtn('left', true);
            if($(nextImageEl).parent().is(':last-child'))
                this.toggleNavBtn('right', false);
        }
        else
            this.toggleNavBtn('right', false);
    }

    addMainClickEvent(el) {
        $(el).click((e) => {
            // if nav buttons don't open
            if($(e.target).hasClass('jsg-btn'))    return;
            const clickImageImg = $(e.currentTarget).find('img');
            const clickImageSrc = $(clickImageImg).attr('src');
            const clickImageID = $(e.currentTarget).attr('jsg-image-id');

            this.openGalleryModal(clickImageImg, clickImageSrc, clickImageID);
        });
    }

    addExtraClickEvent(el) {
        $(el).click((e) => {
            const mainImageDiv = $(this.gallery).find('.jsg-main-image');

            if(!this.click_extra_open_modal && this.main_image) {
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

        this.generateModal(imgOffset, width, height, src, id);

        this.generateCloseBtn();

        const modalExtraImagesDiv = this.generateModalExtraImageDivs();
        
        $(this.modal).find('.modal-background').animate({
            opacity: '.9',
        }, this.transition_speed);

        const mainDiv = $(this.modal).find('.jsg-main-image');
        $(mainDiv).animate({
            width: '80%',
            height: '70%',
            top: '5%',
            left: '10%'
        }, this.transition_speed, () => {
            $(this.modal).append(modalExtraImagesDiv);
            $(this.modal).append(this.closeBtn);
            this.addExtraContainerScroll(modalExtraImagesDiv, true);
            this.addExtraImagesDrag(modalExtraImagesDiv, true);
            this.appendBtns();
        });
    }

    generateModal(imgOffset, width, height, src, id) {
        this.modal = $(`<div class='js-gallery-modal'>
            <div class='modal-background' style='opacity: 0;'></div>
            <div style='left: ${imgOffset.left}px; top: ${imgOffset.top}px; width: ${width}px; height: ${height}px;' class='jsg-main-image' jsg-image-id='${id}'>
                <img src='${src}' alt='${id}' />
            </div>
        </div>`);

        $('body').append(this.modal);

        $(this.modal).on('wheel', (e) => {
            e.preventDefault();
        });

        $(this.modal).click((e) => {
            if(e.target.tagName !== 'IMG' && !$(e.target).hasClass('jsg-extra-images') && !$(e.target).hasClass('jsg-btn'))
                this.closeModal();
        });
    }

    generateCloseBtn() {
        this.closeBtn = $(`<div class='jsg-close-btn'>&times;</div>`);
        $(this.closeBtn).click((e) => {
            this.closeModal();
        });
    }

    closeModal() {
        const element = this.modal;
        this.modal = null;
        this.appendBtns();

        let img = $(this.gallery).find(`[jsg-image-id='${$(element).find('.jsg-main-image').attr('jsg-image-id')}']`);
        const imgOffset = $(img).offset();
        if(!imgOffset) {
            $(element).remove();
            return;
        }
        const width = $(img).width();
        const height = $(img).height();

        $(element).find('.jsg-extra-images').remove();
        $(this.closeBtn).remove();

        $(element).find('.modal-background').animate({
            opacity: '0',
        }, this.transition_speed);

        $(element).find('.jsg-main-image').animate({
            width: width,
            height: height,
            top: imgOffset.top,
            left: imgOffset.left
        }, this.transition_speed, () => {
            $(element).remove();
        });
    }

    generateModalExtraImageDivs() {
        const modalExtraImagesDiv = $(this.gallery).find('.jsg-extra-images').clone();
        if(this.main_image && !this.include_main_in_extra) {
            $(modalExtraImagesDiv).prepend(`<div class='jsg-extra-image' jsg-image-id='0'><img src='${this.images[0].src}' alt='${this.images[0].alt}' /></div>`)
        }

        $(modalExtraImagesDiv).children().each((index, img) => {
            $(img).click((e) => {
                const mainImg = $(this.modal).find('.jsg-main-image');
                $(mainImg).attr('jsg-image-id', $(e.currentTarget).attr('jsg-image-id'));
                $(mainImg).find('img').attr('src', $(e.currentTarget).find('img').attr('src'));
            });
        });
        return modalExtraImagesDiv;
    }

    addExtraContainerScroll(el, modal = false) {
        $(el).on('wheel', (e) => {
            if(!e.originalEvent.deltaY) return;
            
            $(e.currentTarget).scrollLeft($(e.currentTarget).scrollLeft() + ((e.originalEvent.deltaY > 0) ? 50 : -50));
            e.preventDefault();
        });
    }

    addExtraImagesDrag(el, modal = false) {
        $(el).on('mousedown', (e) => {
            this.lastDragX = e.pageX;
            this.drag = (modal ? 2 : 1);
            e.preventDefault();
        });
        $(el).on('touchstart', (e) => {
            this.lastDragX = e.touches[0].pageX;
            this.drag = (modal ? 2 : 1);
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
            transition_speed: Number($(gallery).attr('transition_speed')),
            nav_buttons: $(gallery).attr('nav_buttons')
        }
        new Gallery(options);
    });
});