sudo tcpdump -nA -i any port 53  | egrep -E 'AAAA\?|A\?|CNAME' | npm run dev
