arrayString="";

for file in * # Подстановка имен файлов.
do
  filename=${file%.png}   #  Удалить расширение ".mac" из имени файла
                         #+ ( с шаблоном '.*c' совпадают все подстроки
                         #+ начинающиеся с '.' и заканчивающиеся 'c',
  arrayString+="\"$filename\",";
done
echo "$arrayString"
