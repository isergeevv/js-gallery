import { NAV_BUTTONS } from "./const";
import Gallery from "./Gallery";
import { Position, Size } from "./types";

export default class GalleryModal {
  private _gallery: Gallery;
  private _modalEl: HTMLElement | null;
  private _closeBtnEl: HTMLElement | null;
  private _btnLeftEl: HTMLElement;
  private _btnRightEl: HTMLElement;
  private _lastDragX: number;
  private _drag: boolean;
  private _click: boolean;

  constructor(gallery: Gallery) {
    this._gallery = gallery;
    this._modalEl = null;
    this._closeBtnEl = null;
  }

  get isOpen() {
    return this._modalEl !== null ? true : false;
  }
  get element() {
    return this._modalEl;
  }
  get background() {
    if (!this._modalEl) {
      throw new Error(`[GalleryModal->background] Missing modal element.`);
    }

    const backgroundEl = this._modalEl.querySelector(".modal-background");
    if (!backgroundEl) {
      throw new Error(
        `[GalleryModal->background] Missing background element for gallery modal.`
      );
    }

    return backgroundEl as HTMLElement;
  }
  get mainImageContainer() {
    if (!this._modalEl) {
      throw new Error(
        `[GalleryModal->mainImageContainer] Missing modal element.`
      );
    }

    const mainImageContainerEl = this._modalEl.querySelector(".jsg-main-image");
    if (!mainImageContainerEl) {
      throw new Error(
        `[GalleryModal->mainImageContainer] Missing main image div element for gallery modal.`
      );
    }

    return mainImageContainerEl as HTMLElement;
  }
  get extraImageContainersContainer() {
    if (!this._modalEl) {
      throw new Error(
        `[GalleryModal->extraImageContainersContainer] Missing modal element.`
      );
    }

    const extraImageContainersContainerEl =
      this._modalEl.querySelector(".jsg-extra-images");
    if (!extraImageContainersContainerEl) {
      throw new Error(
        `[GalleryModal->extraImageContainersContainer] Missing extra image containers container element for gallery modal.`
      );
    }

    return extraImageContainersContainerEl as HTMLElement;
  }

  create(imgContainer: HTMLElement) {
    const id = imgContainer.dataset.imageId || "";

    const img = imgContainer.querySelector("img");
    if (!img) {
      throw new Error("[GalleryModal->create] Missing img element.");
    }

    const src = img.src;
    const imgRect = img.getBoundingClientRect();

    this.#generateModal();

    this.#generateModalBackground();

    this.#generateMainImageContainer(
      { left: imgRect.left, top: imgRect.top },
      { width: imgRect.width, height: imgRect.height },
      src,
      id
    );

    const modalExtraImagesContainersContainer =
      this.#generateExtraImagesContainersContainer();

    this.#generateCloseBtn();

    setTimeout(() => {
      const modalBg = this.background;
      const mainImageContainer = this.mainImageContainer;

      modalBg.style.opacity = ".9";

      mainImageContainer.style.width = "80%";
      mainImageContainer.style.height = "70%";
      mainImageContainer.style.top = "5%";
      mainImageContainer.style.left = "10%";
    }, 5);

    setTimeout(() => {
      if (!this._modalEl) return;

      if (this._closeBtnEl) {
        this._modalEl.appendChild(this._closeBtnEl);
      }

      if (modalExtraImagesContainersContainer) {
        this._modalEl.appendChild(modalExtraImagesContainersContainer);
      }

      if (this._gallery.options.navButtons) {
        this.#generateNavButtons();
      }

      if (this._gallery.options.modal.mainImageFollowModal) {
        const mainImageContainer = this._gallery.mainImageContainer;
        mainImageContainer.dataset.imageId = id;

        const mainImage = mainImageContainer.querySelector("img");
        if (mainImage) {
          mainImage.setAttribute("src", src);
        }

        this._gallery.updateNavButtons();
      }
    }, this._gallery.options.transitionSpeed);
  }

  #generateExtraImagesContainersContainer() {
    if (!this._modalEl) {
      throw new Error(
        "[GalleryModal->generateExtraImagesContainersContainer] Missing modal element."
      );
    }

    const extraImageContainersContainerEl = document.createElement("div");
    extraImageContainersContainerEl.classList.add("jsg-extra-images");
    this._modalEl.appendChild(extraImageContainersContainerEl);

    if (this._gallery.options.extraImages) {
      this.#generateExtraImageContainers(extraImageContainersContainerEl);
    } else {
      extraImageContainersContainerEl.style.display = "none";
    }

    return extraImageContainersContainerEl;
  }

  #generateNavButtons() {
    this._btnLeftEl = document.createElement("div");
    this._btnLeftEl.classList.add("jsg-btn", "jsg-btn_left");
    this._btnLeftEl.innerText = "⏴";
    this._btnRightEl = document.createElement("div");
    this._btnRightEl.classList.add("jsg-btn", "jsg-btn_right");
    this._btnRightEl.innerText = "⏵";

    this._btnLeftEl.addEventListener("click", () => this.#moveToPrevImage());
    this._btnRightEl.addEventListener("click", () => this.#moveToNextImage());

    const mainImageContainerEl = this.mainImageContainer;
    const extraImageContainersContainerEl = this.extraImageContainersContainer;
    mainImageContainerEl.appendChild(this._btnLeftEl);
    mainImageContainerEl.appendChild(this._btnRightEl);

    const currentMainImageId = mainImageContainerEl.dataset.imageId;
    const currentExtraImageEl = extraImageContainersContainerEl.querySelector(
      `.jsg-extra-image[data-image-id="${currentMainImageId}"]`
    );
    if (!currentExtraImageEl) {
      throw new Error(
        "[Gallery->generateNavButtons] Missing current extra image element."
      );
    }
    this.#toggleNavBtn(
      NAV_BUTTONS.RIGHT,
      !!currentExtraImageEl.nextElementSibling
    );
    this.#toggleNavBtn(
      NAV_BUTTONS.LEFT,
      !!currentExtraImageEl.previousElementSibling
    );
  }

  #moveToPrevImage() {
    const mainImageContainerEl = this.mainImageContainer;
    const mainImage = mainImageContainerEl.querySelector("img");
    if (!mainImage) {
      throw new Error("[Gallery->moveToPrevImage] Missing main image.");
    }
    const extraImageContainersContainerEl = this.extraImageContainersContainer;

    const curImageId = mainImageContainerEl.dataset.imageId;
    const curImageContainerEl = extraImageContainersContainerEl.querySelector(
      `.jsg-extra-image[data-image-id="${curImageId}"]`
    ) as HTMLElement;
    const prevImageContainerEl =
      curImageContainerEl.previousElementSibling as HTMLElement;

    if (prevImageContainerEl) {
      const prevImageEl = prevImageContainerEl.querySelector(`img`);
      if (!prevImageEl) {
        throw new Error(
          "[Gallery->moveToPrevImage] Missing prev image element."
        );
      }
      const prevImageId = prevImageContainerEl.dataset.imageId || "";
      const src = prevImageEl.getAttribute("src") || "";

      mainImageContainerEl.dataset.imageId = prevImageId;
      mainImage.setAttribute("src", src);

      this.#toggleNavBtn(NAV_BUTTONS.RIGHT, true);
      this.#toggleNavBtn(
        NAV_BUTTONS.LEFT,
        !!prevImageEl.parentElement?.previousElementSibling
      );

      if (this._gallery.options.modal.mainImageFollowModal) {
        this._gallery.updateMainImage(src, prevImageId);
      }
    } else {
      mainImageContainerEl.dataset.imageId = "0";
      mainImage.setAttribute("src", this._gallery.images[0].src);
      this.#toggleNavBtn(
        NAV_BUTTONS.RIGHT,
        !!curImageContainerEl.nextElementSibling
      );
      this.#toggleNavBtn(NAV_BUTTONS.LEFT, false);
    }
  }

  #moveToNextImage() {
    const mainImageContainerEl = this.mainImageContainer;
    const mainImage = mainImageContainerEl.querySelector("img");
    if (!mainImage) {
      throw new Error("[Gallery->moveToPrevImage] Missing main image.");
    }
    const extraImageContainersContainerEl = this.extraImageContainersContainer;

    const curImageId = mainImageContainerEl.dataset.imageId;
    const curImageContainerEl = extraImageContainersContainerEl.querySelector(
      `.jsg-extra-image[data-image-id="${curImageId}"]`
    ) as HTMLElement;
    const nextImageContainerEl =
      curImageContainerEl.nextElementSibling as HTMLElement;

    if (nextImageContainerEl) {
      const nextImageEl = nextImageContainerEl.querySelector(`img`);
      if (!nextImageEl) {
        throw new Error(
          "[Gallery->moveToNextImage] Missing next image element."
        );
      }

      const nextImageId = nextImageContainerEl.dataset.imageId || "";
      const src = nextImageEl.getAttribute("src") || "";
      mainImageContainerEl.dataset.imageId = nextImageId;
      mainImage.setAttribute("src", src);
      this.#toggleNavBtn(NAV_BUTTONS.LEFT, true);
      if (!nextImageEl.parentElement?.nextElementSibling) {
        this.#toggleNavBtn(NAV_BUTTONS.RIGHT, false);
      }

      if (this._gallery.options.modal.mainImageFollowModal) {
        this._gallery.updateMainImage(src, nextImageId);
      }
    } else {
      this.#toggleNavBtn(NAV_BUTTONS.RIGHT, false);
    }
  }

  #toggleNavBtn(btn: string, show: boolean) {
    if (!this._modalEl) return;

    const btnEl = this._modalEl.querySelector(`.jsg-btn_${btn}`) as HTMLElement;
    if (btnEl) btnEl.style.display = show ? "block" : "none";
  }

  #generateModal() {
    this._modalEl = document.createElement("div");
    this._modalEl.classList.add("jsg-modal");

    document.body.appendChild(this._modalEl);

    this._modalEl.addEventListener("wheel", (e) => e.preventDefault());

    this._modalEl.addEventListener("click", (e) => {
      if (!e.target) return;

      const target = e.target as HTMLElement;

      if (
        target.tagName !== "IMG" &&
        !target.classList.contains("jsg-extra-images") &&
        !target.classList.contains("jsg-btn")
      )
        this.#closeModal();
    });
  }

  #generateModalBackground() {
    if (!this._modalEl) {
      throw new Error(
        "[GalleryModal->generateModalBackground] Missing modal element."
      );
    }

    const modalBg = document.createElement("div");
    modalBg.classList.add("modal-background");
    modalBg.style.opacity = "0";
    modalBg.style.transition = `all ${this._gallery.options.transitionSpeed}ms ease-in-out`;
    this._modalEl.appendChild(modalBg);
  }

  #generateMainImageContainer(
    pos: Position,
    size: Size,
    src: string,
    id: string
  ) {
    if (!this._modalEl) {
      throw new Error(
        "[GalleryModal->generateMainImageContainer] Missing modal element."
      );
    }

    const mainImageContainerEl = document.createElement("div");
    mainImageContainerEl.classList.add("jsg-main-image");
    mainImageContainerEl.dataset.imageId = id;
    mainImageContainerEl.style.cssText = `left: ${pos.left}px; top: ${pos.top}px; width: ${size.width}px; height: ${size.height}px;`;
    mainImageContainerEl.style.transition = `all ${this._gallery.options.transitionSpeed}ms ease-in-out`;

    const mainImg = document.createElement("img");
    mainImg.setAttribute("src", src);
    mainImg.setAttribute("alt", id);
    mainImageContainerEl.appendChild(mainImg);
    this._modalEl.appendChild(mainImageContainerEl);

    return mainImageContainerEl;
  }

  #closeModal() {
    const element = this._modalEl;
    if (!element) return;

    const mainImageContainer = this.mainImageContainer;

    const img = (() => {
      if (this._gallery.options.mainImage) {
        return this._gallery.mainImageContainer.querySelector(
          `img`
        ) as HTMLElement;
      }

      const galleryExtraImageContainersContainer =
        this._gallery.extraImageContainersContainer;
      return galleryExtraImageContainersContainer.querySelector(
        `.jsg-extra-image[data-image-id='${mainImageContainer.dataset.imageId}']`
      ) as HTMLElement;
    })();

    if (!img) {
      throw new Error("[GalleryModal->closeModal] Missing image element.");
    }

    const imgRect = img.getBoundingClientRect();
    if (!imgRect.top && !imgRect.left) {
      element.remove();
      return;
    }

    this.extraImageContainersContainer?.remove();
    this._closeBtnEl?.remove();
    this._btnLeftEl?.remove();
    this._btnRightEl?.remove();

    const background = this.background;

    background.style.opacity = "0";
    mainImageContainer.style.width = `${imgRect.width}px`;
    mainImageContainer.style.height = `${imgRect.height}px`;
    mainImageContainer.style.top = `${imgRect.top}px`;
    mainImageContainer.style.left = `${imgRect.left}px`;

    this._modalEl = null;

    setTimeout(() => {
      element.remove();
    }, this._gallery.options.transitionSpeed);
  }

  remove() {
    if (!this._modalEl) return;
    this._modalEl.remove();
    this._modalEl = null;
  }

  #generateExtraImageContainers(container?: HTMLElement) {
    if (!container) container = this.extraImageContainersContainer;

    container.addEventListener("wheel", (e) => {
      if (!e.deltaY || !e.currentTarget) return;

      const extraImageContainersContainerEl =
        this.extraImageContainersContainer;

      extraImageContainersContainerEl.scrollLeft =
        extraImageContainersContainerEl.scrollLeft + (e.deltaY > 0 ? 50 : -50);
      e.preventDefault();
    });

    container.addEventListener("pointerdown", (e) => {
      this._drag = true;
      this._click = true;
      this._lastDragX = e.pageX;

      const extraImageContainersContainerEl =
        this.extraImageContainersContainer;

      if (e.target) {
        const target = e.target as HTMLElement;
        extraImageContainersContainerEl.dataset.targetImage =
          target.parentElement?.dataset.imageId || "";
      }

      this.extraImageContainersContainer.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    container.addEventListener("pointermove", (e) => {
      if (!this._drag) return;
      if (this._click) this._click = false;

      const extraImageContainersContainerEl =
        this.extraImageContainersContainer;

      extraImageContainersContainerEl.scrollLeft =
        extraImageContainersContainerEl.scrollLeft +
        (this._lastDragX - e.pageX);

      this._lastDragX = e.pageX;
      e.preventDefault();
    });

    const onClickModalExtraImage = (target: HTMLElement) => {
      if (!target) {
        throw new Error(
          "[GalleryModal->onClickModalExtraImage] Missing target element."
        );
      }

      if (!target.classList.contains("jsg-extra-image")) return;

      const mainImageContainerEl = this.mainImageContainer;

      if (this._gallery.options.mainImage) {
        const clickImageID = target.dataset.imageId || "";
        const mainImageId = mainImageContainerEl.dataset.imageId || "";

        if (clickImageID != mainImageId) {
          mainImageContainerEl.dataset.imageId = clickImageID;
          const mainImageEl = mainImageContainerEl.querySelector("img");
          if (!mainImageEl) {
            throw new Error(
              `[Gallery->buildGallery] Missing main image element.`
            );
          }

          const clickImageImg = target.querySelector("img");
          if (!clickImageImg) {
            throw new Error(
              `[Gallery->buildGallery] Missing clicked image container image element.`
            );
          }

          const clickImageSrc = clickImageImg.getAttribute("src") || "";

          mainImageEl.setAttribute("src", clickImageSrc);

          this.#toggleNavBtn(NAV_BUTTONS.RIGHT, !!target.nextElementSibling);

          this.#toggleNavBtn(NAV_BUTTONS.LEFT, !!target.previousElementSibling);

          if (this._gallery.options.modal.mainImageFollowModal) {
            this._gallery.updateMainImage(clickImageSrc, clickImageID);
          }
        }
      }
    };

    let i = this._gallery.options.excludeMainFromExtraImages ? 1 : 0;
    while (i < this._gallery.images.length) {
      const extraDiv = document.createElement("div");
      extraDiv.classList.add("jsg-extra-image");
      extraDiv.dataset.imageId = i.toString();
      const extraDivImg = document.createElement("img");
      extraDivImg.setAttribute("src", this._gallery.images[i].src);
      extraDivImg.setAttribute("alt", this._gallery.images[i].alt);
      extraDiv.appendChild(extraDivImg);

      container.appendChild(extraDiv);

      i++;
    }

    window.addEventListener("pointerup", (e) => {
      if (!this._drag) return;

      const extraImageContainersContainerEl =
        this.extraImageContainersContainer;

      if (this._click && e.target) {
        const imageId =
          extraImageContainersContainerEl.dataset.targetImage || "";
        delete extraImageContainersContainerEl.dataset.targetImage;

        const target = extraImageContainersContainerEl.querySelector(
          `.jsg-extra-image[data-image-id="${imageId}"]`
        ) as HTMLElement;
        onClickModalExtraImage(target);
      }

      this._drag = false;
      extraImageContainersContainerEl.releasePointerCapture(e.pointerId);
      e.preventDefault();
    });

    return container;
  }

  #generateCloseBtn() {
    this._closeBtnEl = document.createElement("div");
    this._closeBtnEl.classList.add("jsg-close-btn");
    this._closeBtnEl.innerHTML = "&times;";
    this._closeBtnEl.addEventListener("click", () => this.#closeModal());
  }
}

