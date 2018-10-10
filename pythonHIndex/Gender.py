from scopus import ScopusAuthor
import pandas as pd
from chicksexer import predict_gender
# https://scopus.readthedocs.io/en/latest/reference/scopus.ScopusSearch.html?highlight=scopussearch
from scopus import ScopusSearch
from scopus import ScopusAbstract
from time import sleep

import gender_guesser.detector as gender
data = pd.read_csv('out.csv')


data.drop(data.columns[1:14], axis=1, inplace=True)

genders = []
gendersProbability = []
d = gender.Detector()
# remove first 14 cols pandas
for i, row in data.iterrows():

    if 'firstAuthor' in row:
        name = str(row['firstAuthor'])
        name = name.encode("ascii", errors="ignore").decode()
        firstName = str(row['firstAuthor']).split(" ")[0]
        genders.append(d.get_gender(firstName))
        gendersProbability.append(predict_gender(name))
data['genders'] = genders
data['gendersProbability'] = gendersProbability

data.to_csv("genders.csv")
