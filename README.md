# Diagram Visualizer

Simple HTML/Javascript visualizer for viewing diagram extractions.

## Setup

Create three directories or symlinks in the root
folder. ```diagram_candidates``` should contain to the candidate
annotation json in one-json-per-image format, ```images``` should
contain to the rescaled images, and ```images_original``` should
contain the original images.

```images``` can be populated from the AWS bucket ```s3:///ai2-vision-datasets/shining2/imagesResized```

```images_original``` can be populated from the AWS bucket ```s3:///ai2-vision-datasets/shining2/images```

## Usage

Open viz.html?img=img-id in Safari (NOT Google Chrome),
be.g. viz.html?img=805.png.