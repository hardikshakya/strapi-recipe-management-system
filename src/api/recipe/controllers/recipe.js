"use strict";

/**
 * recipe controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::recipe.recipe", ({ strapi }) => ({
  async find(ctx) {
    const { name, category, ingredient, preparation_time, populate, fields } =
      ctx.query;

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
  },
}));
