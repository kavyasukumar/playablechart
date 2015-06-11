###
# Compass
###

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
# page "/path/to/file.html", :layout => :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", :locals => {
#  :which_fake_page => "Rendering a fake page with a local variable" }

###
# Helpers
###

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

set :app_name, data.autotune.title

set :title, data.autotune.title
set :slug, data.autotune.slug
set :comments_slug, data.autotune.slug
set :meta_description, 'Autotune playable chart'
set :no_index, true

if (data.autotune.theme == 'custom')
  set :vertical, 'chorusforads'
else
  set :vertical, data.autotune.theme
end

set :layout, 'default'

set :trailing_slashes, true

activate :directory_indexes

spreadsheet_key = data.autotune.google_doc_url.match(/[-\w]{25,}/)

# Load a single spreadsheet
activate :google_drive, load_sheets: {
  mysheet: spreadsheet_key
}

# set :tweet_text, data.autotune.tweet_text

# sheet_name = data.mysheet.keys
# tbd = data.mysheet[sheet_name[0]]
# num_items = tbd[0].length
# tbd.each do |item|
#   count = 0
#   item.each do |k, v|
#     if v.nil? || v.to_s.gsub(' ', '-') == '-'
#       count+= 1
#     end
#   end
#   if count === num_items
#     tbd.delete(item)
#   end
# end

# set :table_data, tbd


# Load multiple google spreadsheets
# activate :google_drive, load_sheets: {
#     spreadsheet: 'my_key'
# }

# Activate the chorus exension to use the `chorus` object
# activate :chorus, domain: 'www.vox.com'
# Load content from chorus with an entry slug or id
# activate :chorus, load_entries: {
#     story: 'my-story-slug'
# }

# Build-specific configuration
configure :build do
  require 'uri'
  uri = URI(data.autotune.base_url)
  set :absolute_prefix, uri.scheme.nil? ? "//#{uri.host}" : "#{uri.scheme}://#{uri.host}"

  set :url_prefix, uri.path
  set :http_prefix, data.autotune.base_url

  activate :asset_hash
  activate :minify_javascript
  activate :minify_css
end
