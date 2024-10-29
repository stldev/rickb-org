DROP TABLE #tempTable1

CREATE TABLE #tempTable1
  (
     adempid VARCHAR(255),
     ademail VARCHAR(255),
     addept  VARCHAR(255),
     aduac   VARCHAR(255)
  )

DECLARE @sChar CHAR(1)
DECLARE @body VARCHAR(8000)
DECLARE @nAsciiValue SMALLINT

SELECT @nAsciiValue = 65

WHILE @nAsciiValue < 91
  BEGIN
      SELECT @sChar = Char(@nAsciiValue)

		SET @body = (SELECT 'SELECT TOP 900 * FROM OPENQUERY(ADSI, ''<LDAP://OU=TestUsers1,DC=yourDomain,DC=com>;'
                          + '(&(samaccountname=' + @SChar + '*));'
                          + 'samaccountname,mail,department,useraccountcontrol'')')

      INSERT #tempTable1
      EXEC( @body)

      SELECT @nAsciiValue = @nAsciiValue + 1
  END

SELECT Isnull(adempid, 'noValue') AS 'empID',
       Isnull(ademail, 'noValue') AS 'eMail',
	   Isnull(addept, 'noValue') AS 'dept',
	   Isnull(aduac, 'noValue') AS 'status'
FROM   #tempTable1 