function skip(page){
  return page.currentPage == 0 || page.currentPage == 1 ? 0 : page.itemsPerPage * (page.currentPage - 1);
};

function limit(page){
    return page.itemsPerPage;
}

module.exports = {
   skip : skip,
   limit : limit
};