const gallery = new Gallery({
  selector: "#gallery",
  //   images: [],
  mainImage: true,
  extraImages: true,
  excludeMainFromExtraImages: false,
  transitionSpeed: 500,
  navButtons: true,
  modal: {
    enable: true,
    clickExtraImageOpenModal: true,
    mainImageFollowModal: true,
  },
});

