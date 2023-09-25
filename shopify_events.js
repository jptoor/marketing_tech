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
    item_variant: item[key].sku,
    price: item[key].price.amount,
    quantity: item[key].quantity || 1
  }));
}

function triggerDataLayerEvent(eventType, eventData) {
    let ga4Ecommerce = {};
    let ga4Items = [];

    try {
      switch (eventType) {
          case "page_viewed":
              break;
          case "search_submitted":
              break;


          case "collection_viewed":
              ga4Items = eventData.collection.productVariants.map((variant) => ({
                  item_id: variant.id,
                  item_name: variant.product.title,
                  item_variant: variant.sku,
                  currency: variant.price.currencyCode,
                  price: variant.price.amount
              }));
              ga4Ecommerce = {
                  items: ga4Items
              };
              break;

          case "product_added_to_cart":          
          case "product_removed_from_cart":
            productData = eventData.cartLine.merchandise
            ga4Items = {
                item_id: productData.product.id,
                item_name: productData.product.title,
                item_variant: productData.product.sku,
                price: productData.price.amount,
                quantity: productData.quantity || 1
            }
            ga4Ecommerce = {
                currency: productData.price.currencyCode,
                items: ga4Items,
                value: productData.price.amount
            };
            break;
          
          case "product_viewed":
              ga4Items = [{
                  currency: eventData.productVariant.price.currencyCode,
                  item_id: eventData.productVariant.id,
                  item_name: eventData.productVariant.product.title,
                  item_variant: eventData.productVariant.sku,
                  price: eventData.productVariant.price.amount
              }];
              ga4Ecommerce = {
                  currency: eventData.productVariant.price.currencyCode,
                  items: ga4Items,
                  value: eventData.productVariant.price.amount
              };
              break;

          case "cart_viewed":
            ga4Items = mapItems(eventData.cart.lines, "merchandise");
            ga4Ecommerce = {
              currency: eventData.cart.cost.totalAmount.currencyCode,
              items: ga4Items,
              value: eventData.cart.cost.totalAmount.amount
            };
            break;

          case "checkout_started":
          case "checkout_address_info_submitted":
          case "checkout_contact_info_submitted":
          case "checkout_shipping_info_submitted":
          case "checkout_completed":
              ga4Items = mapItems(eventData.checkout.lineItems, "variant");
              ga4Ecommerce = {
                currency: eventData.checkout.totalPrice.currencyCode,
                items: ga4Items,
                value: eventData.checkout.totalPrice.amount
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
      window.dataLayer.push({
          event: eventType,
          ecommerce: ga4Ecommerce
      });
    } 
    catch (error) {
    console.error(`Failed to handle event ${eventType}:`, error);
  }
}


events.forEach((eventName) => {
  analytics.subscribe(eventName, (event) => {
    console.log(event);
    triggerDataLayerEvent(eventName, event.data);
  });
});