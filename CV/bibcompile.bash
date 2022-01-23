#!/bin/bash

for i in $(ls *.bib); do
    filename=$i
    filename=${filename%.b*b}
    bibtex $filename
done