# do-an-xe
Slack App đặt đồ ăn xế ở Silicon Straits Saigon.

## Post menu to Slack
![](https://user-images.githubusercontent.com/4214509/32046465-55c87326-ba6d-11e7-909c-19f129a7ee30.gif)

```
title Send menu to Slack
Admin->Slack: Enter '/do-an' command
Slack->do-an-xe: (Webhook) trigger /order
do-an-xe->AirTable: Get food menu
AirTable->do-an-xe: Return menu
do-an-xe->Slack: (Webhook) post to channel
```
![](https://www.websequencediagrams.com/cgi-bin/cdraw?lz=dGl0bGUgU2VuZCBtZW51IHRvIFNsYWNrCgpBZG1pbi0-AAkFOiBFbnRlciAnL2RvLWFuJyBjb21tYW5kCgAnBS0-ABEFLXhlOiAoV2ViaG9vaykgSFRUUCByZXF1ZXN0CgAZCC0-QWlyVGFibGU6IEdldCBmb28AcwYKABAIAEEMUmV0dXJuABoGADgKAIELBwBgCnBvc3QgdG8gY2hhbm5lbAoK&s=qsd)

## User create an order

![gif1](https://user-images.githubusercontent.com/4214509/32046719-08309b38-ba6e-11e7-99ff-28d36b323973.gif)
![gif9](https://user-images.githubusercontent.com/4214509/32046574-aaa695d0-ba6d-11e7-8dd1-a6587112a038.gif)
![gif8](https://user-images.githubusercontent.com/4214509/32046571-a9492324-ba6d-11e7-960f-b29dd1821dc2.gif)

```
title Create an order
User->Slack: click order button
Slack->do-an-xe: HTTP request
do-an-xe->AirTable: is order form closed yet?
AirTable->do-an-xe: return order form status
alt order form is closed by admin
    do-an-xe->Slack: show error
else order form is available
    do-an-xe->AirTable: check user staff ID registered
    AirTable->do-an-xe: staff information
    alt staff not registered to Slack user id
        do-an-xe->Slack: show register dialog
        Slack->User: show register dialog
        User->Slack: enter register information
        Slack->do-an-xe: send register information
        do-an-xe->AirTable: update Slack user id to Staff (registered)
    end    
    do-an-xe->AirTable: check remaining coupon
    AirTable->do-an-xe: return remaining coupon
    alt remaining coupon < order quantity
        do-an-xe->Slack: show error to User
    else remaining coupon >= order quantity
        do-an-xe->AirTable: create order
        AirTable->do-an-xe: success
        do-an-xe->Slack: show success message
    end
end
```
![](https://www.websequencediagrams.com/cgi-bin/cdraw?lz=dGl0bGUgQ3JlYXRlIGFuIG9yZGVyClVzZXItPlNsYWNrOiBjbGljawATBiBidXR0b24KABUFLT5kby1hbi14ZTogSFRUUCByZXF1ZXN0CgAPCC0-QWlyVGFibGU6IGlzADsHZm9ybSBjbG9zZWQgeWV0PwoAHAgAQwxyZXR1cgCBBgcALAZzdGF0dXMKYWx0ADwMaXMAQwhieSBhZG1pbgogICAgAHcKAIE8B3Nob3cgZXJyb3IKZWxzZQA0D2F2YWlsYWJsZQAuDwCBNApjaGVjayB1c2VyIHN0YWZmIElEIHJlZ2lzdGVyZWQAbwUAgTMUACYGaW5mb3JtYXRpbwCBGAZhbHQAPwdub3QAPAsgdG8gAIJuBQBjBmkAUgYAgTYaAHkIIGRpYWxvZwAlCQCDFgdVc2VyAAsfAINaDWVudGVyAEsKAIEmEABPCwCBVgtlbmQAFR4Ag3gUdXBkYXRlAIFeDgCBeAUAglYFKACCTwopAINJBWVuZCAgICAAgn4fcmVtYWluaW5nIGNvdXAAgmQHAIRBGwAbFWFsdAA4ESA8AIV1B3F1YW50aXR5AIJ4HwCEYgUgdG8AglkFAIE7BmxzZQBFEj49ADYiAIR3CwCHHAYAhxkGAIQQCACEXxV1Y2Nlc3MAhB0fAB8HIG1lc3NhZwCFcwZlbmQKZW5kCgo&s=qsd)
