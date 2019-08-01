#!C:\Vlad\Tools\depot_tools\python276_bin\python.exe

## Define Modules
import re;
import os;
import sys;
import shutil;

## Define files
templateFolder = "Template";
newPage = "";
NewType = "";
## Check to make sure name is set
if (len(sys.argv) >= 2):
    newPage = sys.argv[1].lower();
    newType = sys.argv[2];
else:
    print "Welcome to Web Page Generator";
    print "First Argument is the Page name"
    print "Second Argment is:"
    print "                                   Web for Web Page";
    print "                                   App for Web App";
    print "Missing page name!";

## Copy Template files to new folder
temp = templateFolder + newType;
for root, dirs, files in os.walk(temp):
   for file in files:
      try:
          print newPage;
          print newType
          os.stat(newPage);
      except:
          os.mkdir(newPage);
      shutil.copyfile (os.path.join(temp, file), os.path.join(newPage, file));

## Compile REGEX
if newType == "Web":
  REGEXES = [(re.compile(r'Templateweb'), newPage.title()),(re.compile(r'templateweb'), newPage)];
  ## Rename files from template to new page.
  os.rename(os.path.join(newPage, 'Templateweb.component.ts'), os.path.join(newPage, newPage + '.component.ts.cpy'));
  os.rename(os.path.join(newPage, 'Templateweb.module.ts'     ), os.path.join(newPage, newPage + '.module.ts.cpy'));
  os.rename(os.path.join(newPage, 'Templateweb.routing.ts'        ), os.path.join(newPage, newPage + '.routing.ts.cpy'));
else:
  REGEXES = [(re.compile(r'Templateapp'), newPage.title()),(re.compile(r'templateapp'), newPage)];
  ## Rename files from template to new page.
  os.rename(os.path.join(newPage, 'Templateapp.component.ts'), os.path.join(newPage, newPage + '.component.ts.cpy'));
  os.rename(os.path.join(newPage, 'Templateapp.module.ts'     ), os.path.join(newPage, newPage + '.module.ts.cpy'));
  os.rename(os.path.join(newPage, 'Templateapp.routing.ts'        ), os.path.join(newPage, newPage + '.routing.ts.cpy'));

## Edit Component
with open(os.path.join(newPage, newPage + '.component.ts.cpy'), "r") as fi, open(os.path.join(newPage, newPage + '.component.ts'), "w") as fo:
    for line in fi:
         for search, replace in REGEXES:
               line = search.sub(replace, line);

         fo.write(line);

fo.close();
fi.close();
os.remove(os.path.join(newPage, newPage + '.component.ts.cpy'));

## Edit Module
with open(os.path.join(newPage, newPage + '.module.ts.cpy'), "r") as fi, open(os.path.join(newPage, newPage + '.module.ts'), "w") as fo:
    for line in fi:
         for search, replace in REGEXES:
               line = search.sub(replace, line);

         fo.write(line);

fo.close();
fi.close();
os.remove(os.path.join(newPage, newPage + '.module.ts.cpy'));

## Edit Routing
with open(os.path.join(newPage, newPage + '.routing.ts.cpy'), "r") as fi, open(os.path.join(newPage, newPage + '.routing.ts'), "w") as fo:
    for line in fi:
         for search, replace in REGEXES:
               line = search.sub(replace, line);

         fo.write(line);

fo.close();
fi.close();
os.remove(os.path.join(newPage, newPage + '.routing.ts.cpy'));

## Edit Routing
shutil.copyfile ('app-routing.module.ts', 'app-routing.module.ts.orig');
with open('app-routing.module.ts.orig', "r") as fi, open('app-routing.module.ts', "w") as fo:
    for line in fi:
        if re.search('template', line):
              fo.write("{ path: '" + newPage + "',                            loadChildren: './" + newPage + "/" + newPage + ".module#" + newPage.title() + "Module'},\n");

        fo.write(line);

fo.close();
fi.close();

## Edit Css
##shutil.copyfile ('app-routing.module.ts', 'app-routing.module.ts.orig');
##with open('app-routing.module.ts.orig', "r") as fi, open('app-routing.module.ts', "w") as fo:
##    for line in fi:
##        if re.search('template', line):
##              fo.write("{ path: '" + newPage + "',                            loadChildren: './" + newPage + "/" + newPage + ".module#" + newPage.title() + "Module'},\n");
##
##        fo.write(line);
##
##fo.close();
##fi.close();

file = "../pages/" + newPage + ".html";

if newType == "Web":
  web = open(file, 'w');
  web.write("<div id='" + newPage + "' ></div>");
  web.close();
