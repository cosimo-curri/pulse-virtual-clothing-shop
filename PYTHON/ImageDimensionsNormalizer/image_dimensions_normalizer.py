import csv

def read_CSV(file_CSV):
    with open(file_CSV, "r") as file:
        reader = csv.reader(file)

        next(reader)

        for raw in reader:
            try:
                height = float(raw[10])
                heightNormalized = 350 / 180 * height

                print(heightNormalized)
            except ValueError:
                print("An error occurred.")

file_CSV = "human.csv"
read_CSV(file_CSV)