-- img_to_link.lua
function Image(img)
  local link = pandoc.Link("", img.src, "")
  link.content = { img }
  link.attributes["target"] = "_blank"
  return link
end
