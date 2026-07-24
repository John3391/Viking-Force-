const id = Date.now().toString() + "_" + Math.random().toString(36).substring(7);
console.log(id.split("_")[1]);
console.log(parseInt(id.split("_")[1] || "0"));
