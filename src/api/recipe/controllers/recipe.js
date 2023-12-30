"use strict";

/**
 * recipe controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::recipe.recipe", ({ strapi }) => ({
  async find(ctx) {
    try {
      const { name, category, ingredient, preparation_time, populate, fields } =
        ctx.query;
      console.log(
        "🚀 ~ find ~ name, category, ingredient, preparation_time, populate, fields:",
        name,
        category,
        ingredient,
        preparation_time,
        populate,
        fields
      );

      // Directly handle errors for empty string values in query parameters
      ["name", "category", "ingredient", "preparation_time"].forEach(
        (param) => {
          if (ctx.query.hasOwnProperty(param) && ctx.query[param][0].trim() === "") {
            ctx.response.status = 400;
            ctx.response.body = {
              statusCode: 400,
              error: "Bad Request",
              message: `Empty string provided for query parameter: ${param}`,
            };
            return ctx.response.body;
          }
        }
      );

      const isCustomFilterUsed =
        name || category || ingredient || preparation_time;

      if (!isCustomFilterUsed) {
        const result = await super.find(ctx);
        return result;
      }

      const query = {
        filters: { $and: [] },
        populate,
        fields,
      };

      if (name) {
        query.filters.$and.push({ title: { $containsi: name } });
      }

      if (category) {
        query.filters.category = {
          name: { $eq: category },
        };
      }

      if (ingredient) {
        query.filters.ingredients = {
          name: { $eq: ingredient },
        };
      }

      if (preparation_time) {
        query.filters.$and.push({
          preparation_time: { $lte: Number(preparation_time) },
        });
      }

      if (query.filters.$and.length === 0) {
        delete query.filters.$and;
      }

      // @ts-ignore
      ctx.query = query;

      const result = await super.find(ctx);
      return result;
    } catch (error) {
      ctx.response.status = error.status || 500;
      ctx.response.body = {
        statusCode: ctx.response.status,
        error: "Internal Server Error",
        message:
          error.message || "An error occurred while processing your request.",
      };
      return ctx.response.body;
    }
  },
}));
