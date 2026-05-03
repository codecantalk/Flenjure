export const product = {
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "price",
      title: "Price (String format e.g. $5.99)",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "image",
      title: "Primary Display Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "hoverImage",
      title: "Secondary / Hover Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "sizes",
      title: "Available Sizes",
      type: "array",
      of: [{ type: "string" }],
      description: "Leave empty if product does not have sizes.",
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "T-Shirts", value: "T-Shirts" },
          { title: "Shorts", value: "Shorts" },
          { title: "Tank Tops", value: "Tank Tops" },
          { title: "Hats and Headgear", value: "Hats and Headgear" },
          { title: "Candy Shop", value: "Candy Shop" },
          { title: "New Arrivals", value: "New Arrivals" },
        ]
      }
    }
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
      subtitle: "price",
    },
  },
};
