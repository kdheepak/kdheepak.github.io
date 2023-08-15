-- img-to-link.lua
function Image(img)
  -- Check if the image has the attribute clickable=true
  if img.attributes["clickable"] == "true" then
    local link = pandoc.Link("", img.src, "")
    link.content = { img }
    link.attributes["target"] = "_blank"
    return link
  else
    -- If the image doesn't have the attribute, return it unmodified
    return img
  end
end
