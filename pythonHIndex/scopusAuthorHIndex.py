from scopus import ScopusAuthor
import pandas as pd
# https://scopus.readthedocs.io/en/latest/reference/scopus.ScopusSearch.html?highlight=scopussearch
from scopus import ScopusSearch
from scopus import ScopusAbstract
from time import sleep
from requests.exceptions import HTTPError
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



def test(title, flag=False):

    
    hIndex = 0
    impact = 0
    eid = 0
    firstAuthorId = 0
    if isinstance(title, str):
        title = title.replace('–',' ')
        title = title.replace('(',' ')
        title = title.replace(')',' ')
        title = title.replace('/',' ')
        title = title.replace('\\',' ')
        title = title.replace(';',' ')
        title =  title.encode("ascii", errors="ignore").decode()
       
        try:
            eid = ScopusSearch('TITLE (' +title+')',count=1, refresh=False)
            
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
                    impact = au.author_impact_factor(year=2010, refresh=False)
                    
        except Exception as e:
            print("ERROR - " + "title:"+ title)
            print(e)
            print(e.__class__.__name__)
            if (e.__class__.__name__ == "HTTPError"):
                if (e.response.status_code == 429):
                    print(e.response.headers)
                    sleep(20)
                    if (not flag):
                        # avoid infinite loop
                        return test(title,True)
    else:
        print("ERROR - " + "title is not string:" + str(title))
    print("title: "+ title + " " + "hIndex: " + str(hIndex))
    return (hIndex, impact, eid, firstAuthorId)


# data.apply(test,axis=1)

hIndexes = []
impacts = []
eid = []
authorEid = []
for i,row in data.iterrows():
    if not 'hIndex' in row or row['hIndex'] == 0:
        ret = test(str(row['title']))
        hIndexes.append(ret[0])
        impacts.append(ret[1])
        eid.append(ret[2])
        authorEid.append(ret[3])
    # data.at[i, 'hindex'] = ret[0]
    # data.at[i, 'impact'] = ret[1]
    sleep(1)

data['hIndex'] = hIndexes
data['impact'] = impacts
data['eid'] = eid
data['authorEid'] = authorEid
data.to_csv("out.csv")
