from scopus import ScopusAuthor
import pandas as pd
# https://scopus.readthedocs.io/en/latest/reference/scopus.ScopusSearch.html?highlight=scopussearch
from scopus import ScopusSearch
from scopus import ScopusAbstract

data = pd.read_csv('data.csv')

# eid = ScopusSearch('TITLE (A naturally chimeric type IIA topoisomerase in Aquifex aeolicus highlights an evolutionary path for the emergence of functional paralogs)', refresh=True)
# abs = ScopusAbstract(eid.EIDS[0], view='FULL')

# firstAuthorId = ""
# if (abs):
#     if (len(abs.authors)>0):
#         firstAuthorId = abs.authors[0].auid
# au = ScopusAuthor(24823094900)
# # y = au.author_impact_factor(year=2010, refresh=True)
# hIndex = 0
# if (au):
#     hIndex = au.hindex






def test(x):

    title = x.title
    hIndex = 0
    impact = 0
    title = title.replace('–',' ')
    title = title.replace('(',' ')
    title = title.replace(')',' ')
    title = title.replace('/',' ')
    title = title.replace('\\',' ')
    title = title.replace(';',' ')
    title =  title.encode("ascii", errors="ignore").decode()
    print(title)
    try:
        eid = ScopusSearch('TITLE (' +title+')', refresh=True)
        
        if (len(eid.EIDS)>0):
            abs = ScopusAbstract(eid.EIDS[0], view='FULL')

            firstAuthorId = ""
            if (abs):
                if (len(abs.authors)>0):
                    firstAuthorId = abs.authors[0].auid
            au = ScopusAuthor(firstAuthorId)
            # y = au.author_impact_factor(year=2010, refresh=True)
            
            if (au):
                hIndex = au.hindex
                impact = au.author_impact_factor(year=2010, refresh=True)
    except HTTPError:
        print("ERROR - ")
        print("title" + title)
    x['hindex'] = hIndex
    x['impact'] = impact
    return x


data.apply(test,axis=1)

data.to_csv("out.csv")