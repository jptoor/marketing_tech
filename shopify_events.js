(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-000000');


const events = [
  "cart_viewed",
  "checkout_address_info_submitted",
  "checkout_completed",
  "checkout_contact_info_submitted",
  "checkout_shipping_info_submitted",
  "checkout_started",
  "collection_viewed",
  "page_viewed",
  "payment_info_submitted",
  "product_added_to_cart",
  "product_removed_from_cart",
  "product_viewed",
  "search_submitted"
];

function mapItems(items, key) {
  return items.map((item) => ({
    currency: item[key].price.currencyCode,
    item_id: item[key].id,
    item_name: item[key].product.title,
    item_brand: item[key].product.vendor,
    item_category: item[key].product.type,
    price: item[key].price.amount,
    quantity: item[key].quantity || 1
  }));
}

function mapContents(items, key) {
  return items.map((item) => ({
    id: item[key].id,
    price: item[key].price.amount,
    quantity: item[key].quantity || 1
  }));
}

function mapIds(items, key) {
  return items.map(item => item.id);
}

function triggerDataLayerEvent(eventType, eventObj) {
    let ga4Ecommerce = {};
    let ga4Items = [];
    let content_ids = [];
    let contents = [];
    eventData = eventObj.data;

    try {
      switch (eventType) {
          case "page_viewed":
              break;
          case "search_submitted":
              ga4Ecommerce = {
                search_term: eventData.searchResult.query
              }
              break;


          case "collection_viewed":
              ga4Items = eventData.collection.productVariants.map((variant) => ({
                  item_id: variant.id,
                  item_name: variant.product.title,                
                  // item_variant: variant.sku,
                  currency: variant.price.currencyCode,
                  price: variant.price.amount
              }));
              ga4Ecommerce = {
                  items: ga4Items
              };
              break;

          case "product_added_to_cart":          
          case "product_removed_from_cart":
            productData = eventData.cartLine.merchandise;
            ga4Items = [{
                item_id: productData.product.id,
                item_name: productData.product.title,
                item_brand: productData.product.vendor,
                item_category: productData.product.type,
                // item_variant: productData.product.sku,
                price: productData.price.amount,
                quantity: productData.quantity || 1
            }];
            ga4Ecommerce = {
                currency: productData.price.currencyCode,
                items: ga4Items,
                value: productData.price.amount
            };
            contents = {
                id: productData.product.id,
                // item_variant: productData.product.sku,
                price: productData.price.amount,
                quantity: productData.quantity || 1
            };
            content_ids = [productData.product.id];
            break;
          

          case "product_viewed":
              productData = eventData.productVariant;
              ga4Items = [{
                  currency: productData.price.currencyCode,
                  item_id: productData.id,
                  item_name: productData.product.title,
                  item_category: productData.product.type,                  
                  // item_variant: productData.sku,
                  price: productData.price.amount
              }];
              ga4Ecommerce = {
                  currency: eventData.productVariant.price.currencyCode,
                  items: ga4Items,
                  value: eventData.productVariant.price.amount
              };
              content_ids = [productData.id];
              content_name = productData.product.title;
              break;

          case "cart_viewed":
            productData = eventData.cart.lines;
            ga4Items = mapItems(productData, "merchandise");
            ga4Ecommerce = {
              currency: eventData.cart.cost.totalAmount.currencyCode,
              items: ga4Items,
              value: eventData.cart.cost.totalAmount.amount
            };
            contents = mapContents(productData, "merchandise");
            content_ids = mapIds(productData, "merchandise");
            break;

          case "checkout_started":
          case "checkout_address_info_submitted":
          case "checkout_contact_info_submitted":
          case "checkout_shipping_info_submitted":
              productData = eventData.checkout.lineItems;
              ga4Items = mapItems(productData, "variant");
              contents = mapContents(productData, "variant");
              content_ids = mapIds(productData, "variant");              
              ga4Ecommerce = {
                currency: eventData.checkout.totalPrice.currencyCode,
                items: ga4Items,
                value: eventData.checkout.totalPrice.amount
              };
              break;


          case "checkout_completed":
              productData = eventData.checkout.lineItems;
              ga4Items = mapItems(productData, "variant");
              contents = mapContents(productData, "variant");
              content_ids = mapIds(productData, "variant");
              ga4Ecommerce = {
                currency: eventData.checkout.totalPrice.currencyCode,
                items: ga4Items,
                value: eventData.checkout.totalPrice.amount,
                transaction_id: eventData.checkout.order.id,
                shipping: eventData.checkout.shippingLine.price.amount,
                subtotal: eventData.checkout.subtotalPrice.amount,
                tax: eventData.checkout.totalTax.amount,
                email: eventData.checkout.email,
                phone: eventData.checkout.phone
              };
              break;

          case "payment_info_submitted":
              break;

          default:
              console.warn("Unknown event type:", eventType);
              return;
      }
      // Push to dataLayer
      window.dataLayer = window.dataLayer || [];
      ecommObj = {
          event: eventType,
          ecommerce: ga4Ecommerce,
          eventId: eventObj.id,
          content_ids: content_ids,
          contents: contents

      };
      console.log(ecommObj);
      window.dataLayer.push(ecommObj);
    } 
    catch (error) {
    console.error(`Failed to handle event ${eventType}:`, error);
  }
}


events.forEach((eventName) => {
  analytics.subscribe(eventName, (event) => {
    console.log(event);
    triggerDataLayerEvent(eventName, event);
  });
});