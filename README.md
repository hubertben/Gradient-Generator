# Gradient-Generator
This visual algorithm shows how a neural network is able to produce smooth gradients using simple 'Push Forward' mechanics. The 'Push Forward' part of the neural network means that no back propagation is used. The network is initialized with random weight values and passed each pixels (x, y) location as input and produces a 3D vector, each component for a red, green, and blue component to form a color.

## How to Adjust the Graph

1. One big aspect of the graph you may want to adjust is how many, and the size of the layers in between the input and output. The way to adjust the layer sizes within the code is by adjusting the line:
```bash
const layer_sizes = [2, 6, 3]
```
   The first and last numbers in the list are the layer sizes for the input and output (respectively). **THESE VALUES CANNOT BE ADJUSTED IN ORDER FOR THE PROGRAM TO WORK**. To add    layers into the model, just add more values into the list (values greater than 0):
```bash
const layer_sizes = [2, 16, 8, 4, 3]
```

2. You can also adjust the ammount of each color you see in the graph. Taking a look at the following line of code inside the update function:
```bash
g.h = mapValue(g.h, minH, maxH, 0, 255);
g.i = mapValue(g.i, minI, maxI, 0, 255);
g.j = mapValue(g.j, minJ, maxJ, 0, 255);
```
By adjusting the final part of each of those lines (i.e. ..., 0, 255);), this will adjust the ammount of any given color you would like to see (h -> Red, i -> Green, j -> Blue). Making the '0' larger will make that channel of the RGB lighter:
```bash
// This will make the Red Channel of the final color lighter
g.h = mapValue(g.h, minH, maxH, 100, 255);
```
Alternatively, making the '255' smaller will make the channer of the RGB darker:
```bash
// This will make the Blue Channel of the final color darker
g.j = mapValue(g.j, minJ, maxJ, 0, 100);
```

## Interesting Findings
* Squeezing the neural network through a single node produces a linear gradient. As values pass in through a neural net with layers such as [2, 1 ,3], this will produce a linear gradient with a random angle.
  - Playing around with the layer sizes showed that not only willl the 2nd layer's size determine how the graph ends up curving, but also the more layers that are added in between the input and output will produce more strange results, but ill let you play around with that.

