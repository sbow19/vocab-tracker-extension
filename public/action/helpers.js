export function nodeConvert(nodeList) {
  let newArray = Array.from(nodeList);

  return newArray.map((node) => {
    if (node.value === "default") return "default";
    return JSON.parse(node.value);
  });
}

export function isJsonString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

/**
 * Get list of tags in a tag selection box, selected by the query sleector  provided, and
 * extract the values.
 * @param {*} querySelector
 * @returns
 */
export function getTags(querySelector) {
  //This function will be used for other parts of the UI

  let tagsNodeList = document.querySelectorAll(
    `${querySelector} > li .vocab-tag-inner`
  );

  let tagsList = [];

  for (let tag of tagsNodeList) {
    const tagValue = tag.getAttribute("value");

    if(isJsonString(tagValue)){

      const parsedTagData = JSON.parse(tagValue);
      tagsList.push(parsedTagData);
    } else {
      tagsList.push(tagValue)
    }
  }

  return tagsList;
}
