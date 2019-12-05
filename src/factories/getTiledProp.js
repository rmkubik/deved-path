function getTiledProp(obj, prop) {
  return (
    obj &&
    obj.properties &&
    obj.properties.find(property => property.name === prop).value
  );
}

export default getTiledProp;
