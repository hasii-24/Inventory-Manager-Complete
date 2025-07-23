
function generateInvoice(orderId, product, quantity, price) {
    const url = `http://localhost:8000/invoice.php?orderId=${orderId}&product=${encodeURIComponent(product)}&quantity=${quantity}&price=${price}`;
    window.open(url, "_blank");
}
